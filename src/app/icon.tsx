import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(145deg,#02060d,#071827 62%,#03111d)",
          border: "2px solid #d8a928",
          color: "#d8a928",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            border: "2px solid #168df2",
            borderRadius: 16,
            height: 34,
            position: "relative",
            width: 38,
          }}
        >
          <div style={{ background: "#168df2", borderRadius: 999, height: 7, left: 7, position: "absolute", top: 10, width: 7 }} />
          <div style={{ background: "#168df2", borderRadius: 999, height: 7, position: "absolute", right: 7, top: 10, width: 7 }} />
          <div style={{ background: "#d8a928", borderRadius: 999, bottom: 8, height: 4, left: 10, position: "absolute", width: 18 }} />
          <div style={{ background: "#d8a928", height: 10, left: 17, position: "absolute", top: -10, width: 3 }} />
        </div>
      </div>
    ),
    size,
  );
}
