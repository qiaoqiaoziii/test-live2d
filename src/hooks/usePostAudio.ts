import { useMutation } from "@tanstack/react-query";
import { getAsk } from "../service/api";
import { float32ToBase64 } from "../utils/utils";

export function usePostAudio() {
  const { mutateAsync } = useMutation({
    mutationFn: async (audio: Float32Array) => {
      return getAsk(float32ToBase64(audio));
    },
  });

  return { postAudio: mutateAsync };
}
