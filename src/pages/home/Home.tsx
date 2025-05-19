import * as PIXI from "pixi.js";
import { Live2DModel } from "pixi-live2d-display";
import { useEffect, useRef, useState } from "react";
import { MotionSync } from "live2d-motionsync";
import { modelMap } from "../../models";
import { tts } from "../../tts";
import { Card, Select, Space, Button, Input, Spin } from "antd";
import { useMicVAD } from "@ricky0123/vad-react";
import { usePostAudio } from "../../hooks/usePostAudio";
import { base64ToAudioBuffer } from "../../utils/utils";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).PIXI = PIXI;
async function arrayBufferToAudioBuffer(arrayBuffer: ArrayBuffer) {
  // 创建 AudioContext 实例
  const audioContext = new AudioContext();

  // 使用 decodeAudioData 解码 ArrayBuffer
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  return audioBuffer;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState("");
  const motionSync = useRef<MotionSync>(null);
  const modelName =
    new URLSearchParams(window.location.search).get("model") || "miku";
  const [loading, setLoading] = useState(false);
  const { isPending, postAudio } = usePostAudio();
  const [audio, setAudio] = useState<Float32Array<ArrayBufferLike>>();

  const vad = useMicVAD({
    startOnLoad: false,
    onSpeechEnd: (audio) => {
      setAudio(audio);
    },
  });

  const play = async () => {
    if (!motionSync.current) return;
    const buffer = await tts(text);
    const audioBuffer = await arrayBufferToAudioBuffer(buffer);
    motionSync.current.play(audioBuffer);
  };
  useEffect(() => {
    let app: PIXI.Application;
    let model: Live2DModel;

    const loadModel = async () => {
      if (!canvasRef.current) return;

      // 安全初始化
      app = new PIXI.Application({
        view: canvasRef.current,
        resizeTo: canvasRef.current.parentElement || undefined,
        backgroundAlpha: 0,
      });

      model = await Live2DModel.from(modelMap[modelName], {
        autoInteract: false,
      });

      const modelRatio = model.width / model.height;

      const centerModel = () => {
        model.height = app.view.height;
        model.width = model.height * modelRatio;
        model.x = (app.view.width - model.width) / 2;
        model.y = 0;
      };

      centerModel();
      app.stage.addChild(model as unknown as PIXI.DisplayObject);

      motionSync.current = new MotionSync(model.internalModel);
      motionSync.current.loadMotionSyncFromUrl(
        modelMap[modelName].replace(/.model(.)?.json/, ".motionsync3.json")
      );

      setLoading(false);
    };

    // 确保 DOM 挂载完成后再执行
    requestAnimationFrame(loadModel);

    return () => {
      app?.destroy(true, true);
      model?.destroy();
    };
  }, [modelName]);

  const pauseListen = async () => {
    vad.pause();
    if (audio) {
      const { audio: audioRes } = await postAudio(audio);
      if (audioRes) {
        const audioBuffer = await base64ToAudioBuffer(audioRes);
        motionSync.current?.play(audioBuffer);
        setAudio(undefined);
      }
    }
  };

  return (
    <div className="size-full flex">
      <div className="w-[600px] relative">
        <canvas ref={canvasRef} />
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Spin />
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col gap-2 justify-center">
        <Card title="config" className="max-w-[600px]">
          <div className="flex flex-col gap-2">
            <div>录音状态:{JSON.stringify(vad.listening)}</div>
            <Space>
              <Button
                loading={isPending}
                type="primary"
                onClick={() => vad.start()}
              >
                开始录音
              </Button>
              <Button loading={isPending} onClick={pauseListen}>
                结束录音
              </Button>
            </Space>
            <div>select model:</div>
            <Select
              className="w-full"
              value={modelName}
              onChange={(value) => {
                window.location.href = `http://localhost:5173/?model=${value}`;
              }}
              options={Object.keys(modelMap).map((modelName) => ({
                label: modelName,
                value: modelName,
              }))}
            />
            <div>default text:</div>
            <Space>
              <Button
                type="primary"
                onClick={() => motionSync.current?.play("/output.wav")}
              >
                Play
              </Button>
              <Button danger onClick={() => motionSync.current?.reset()}>
                Reset
              </Button>
            </Space>
            <div>input text:</div>
            <Space>
              <Input.TextArea
                className="w-[450px]"
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="input text"
              />
              <Button type="primary" onClick={play}>
                Play
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  );
}
