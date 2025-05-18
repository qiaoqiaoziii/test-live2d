import { useMutation } from "@tanstack/react-query";
import axios from "axios";

function float32ToBase64(float32Array: Float32Array): string {
  // 1. 创建一个与 Float32Array 等长的 ArrayBuffer 视图（每个 float32 是 4 字节）
  const buffer = Buffer.from(float32Array.buffer);

  // 2. 转成 base64 字符串
  return buffer.toString("base64");
}

export function usePostAudio() {
  // const postAudio = (audio:Float32Array) => {

  // };

  const { mutate } = useMutation({
    mutationFn: (audio: Float32Array) => {
      return axios.post("http://localhost/huggingFace/ask", {
        body: { audio: float32ToBase64(audio) },
      });
    },
  });

  return { postAudio: mutate };
}
