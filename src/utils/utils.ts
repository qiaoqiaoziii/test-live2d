export function float32ToBase64(float32Array: Float32Array): string {
  // 1. 创建一个与 Float32Array 等长的 ArrayBuffer 视图（每个 float32 是 4 字节）
  const buffer = Buffer.from(float32Array.buffer);

  // 2. 转成 base64 字符串
  return buffer.toString("base64");
}

export async function base64ToAudioBuffer(res: string): Promise<AudioBuffer> {
  const audioCtx = new window.AudioContext();

  const binaryString = atob(res);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const arrayBuffer = bytes.buffer;

  // 使用 decodeAudioData 转换为 AudioBuffer
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  return audioBuffer;
}
