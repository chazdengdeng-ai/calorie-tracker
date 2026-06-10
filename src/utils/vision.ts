export interface RecognizedFood {
  name: string;
  calories: number;
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

export function hasVisionApiKey(): boolean {
  return Boolean(API_KEY && API_KEY.trim().length > 0);
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // data:image/...;base64,...
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function recognizeFoodImage(
  file: File,
): Promise<RecognizedFood[]> {
  if (!hasVisionApiKey()) {
    throw new Error(
      "未配置 VITE_GEMINI_API_KEY，无法使用拍照识别。请在 .env 文件中配置。",
    );
  }
  const base64 = await fileToBase64(file);
  const mime = file.type || "image/jpeg";

  const prompt = `请识别这张图片中的食物。请以严格的 JSON 格式返回，不要包含任何 Markdown 代码块标记或额外文字。
格式：{"items":[{"name":"<食物名称中文>","calories":<整数热量kcal>}]}`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mime,
              data: base64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      response_mime_type: "application/json",
    },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`识别失败：${res.status} ${text}`);
  }

  const json = await res.json();
  const textPart: string =
    json?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  const match = textPart.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("无法解析识别结果，请重试。");
  }
  const parsed = JSON.parse(match[0]);
  const items = (parsed?.items || []) as RecognizedFood[];
  return items
    .map((it) => ({
      name: String(it.name || "食物").trim(),
      calories: Math.max(0, Math.round(Number(it.calories) || 0)),
    }))
    .filter((it) => it.name.length > 0 && it.calories > 0);
}
