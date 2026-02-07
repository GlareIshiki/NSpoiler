import kuromoji from "kuromoji";
import path from "path";

let tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures> | null = null;

export async function getTokenizer(): Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>> {
  if (tokenizer) return tokenizer;

  return new Promise((resolve, reject) => {
    kuromoji
      .builder({
        dicPath: path.join(process.cwd(), "node_modules/kuromoji/dict"),
      })
      .build((err, built) => {
        if (err) {
          reject(err);
        } else {
          tokenizer = built;
          resolve(built);
        }
      });
  });
}

export interface TokenInfo {
  surface: string;
  pos: string;
  start: number;
  end: number;
}

export async function tokenize(text: string): Promise<TokenInfo[]> {
  const t = await getTokenizer();
  const tokens = t.tokenize(text);

  let position = 0;
  return tokens.map((token) => {
    const start = text.indexOf(token.surface_form, position);
    const end = start + token.surface_form.length;
    position = end;
    return {
      surface: token.surface_form,
      pos: token.pos,
      start,
      end,
    };
  });
}

// 名詞を優先的に抽出（固有名詞、一般名詞）
export function filterNouns(tokens: TokenInfo[]): TokenInfo[] {
  return tokens.filter(
    (t) =>
      t.pos === "名詞" &&
      t.surface.length >= 2 && // 1文字は除外
      !/^[0-9０-９]+$/.test(t.surface) // 数字のみは除外
  );
}

// ランダムに指定割合を選択
export function selectRandom<T>(items: T[], ratio: number): T[] {
  const count = Math.max(1, Math.floor(items.length * ratio));
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
