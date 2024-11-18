export class App {
  constructor(window, canvas, context, tick, draw, fps) {
    this.window = window;
    this.canvas = canvas;
    this.context = context;
    this.tick = tick;
    this.draw = draw;
    this.fps = fps;
    canvas.onmousemove = (event) => {
      if (this.onMouseMoveHandler) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        this.onMouseMoveHandler(x, y);
      }
    };
  }
  start() {
    let bkt = performance.now();
    const loop = () => {
      const t = performance.now();
      const dt = (bkt - t) / 1000;
      bkt = t;
      this.tick(dt);
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.draw(this.canvas, this.context, dt);
      requestAnimationFrame(loop);
    };
    loop();
  }
};
