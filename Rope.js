import { Vector2 } from "./Vector2.js";
import { lerp } from "./lerp.js";

//each rope part is one of these
//uses a high precison varient of Störmer–Verlet integration
//to keep the simulation consistant otherwise it would "explode"!
class RopePoint {
  //integrates motion equations per node without taking into account relationship
  //with other nodes...
  static integrate(point, gravity, dt, previousFrameDt) {
      point.velocity = Vector2.sub(point.pos, point.oldPos);
      point.oldPos = { ...point.pos };

      //drastically improves stability
      const timeCorrection = previousFrameDt != 0.0 ? dt / previousFrameDt : 0.0;

      const accel = Vector2.add(gravity, { x: 0, y: point.mass });

      const velCoef = timeCorrection * point.damping;
      const accelCoef = Math.pow(dt, 2);

      point.pos.x += point.velocity.x * velCoef + accel.x * accelCoef;
      point.pos.y += point.velocity.y * velCoef + accel.y * accelCoef;
  }

  //apply constraints related to other nodes next to it
  //(keeps each node within distance)
  static constrain(point) {
    if (point.next) {
      const delta = Vector2.sub(point.next.pos, point.pos);
      const len = Vector2.mag(delta);
      const diff = len - point.distanceToNextPoint;
      const normal = Vector2.normalized(delta);

      if (!point.isFixed) {
        point.pos.x += normal.x * diff * 0.25;
        point.pos.y += normal.y * diff * 0.25;
      }

      if (!point.next.isFixed) {
        point.next.pos.x -= normal.x * diff * 0.25;
        point.next.pos.y -= normal.y * diff * 0.25;
      }
    }
    if (point.prev) {
      const delta = Vector2.sub(point.prev.pos, point.pos);
      const len = Vector2.mag(delta);
      const diff = len - point.distanceToNextPoint;
      const normal = Vector2.normalized(delta);

      if (!point.isFixed) {
        point.pos.x += normal.x * diff * 0.25;
        point.pos.y += normal.y * diff * 0.25;
      }

      if (!point.prev.isFixed) {
        point.prev.pos.x -= normal.x * diff * 0.25;
        point.prev.pos.y -= normal.y * diff * 0.25;
      }
    }
  }

  constructor(initialPos, distanceToNextPoint) {
    this.pos = initialPos;
    this.distanceToNextPoint = distanceToNextPoint;
    this.isFixed = false;
    this.oldPos = { ...initialPos };
    this.velocity = Vector2.zero();
    this.mass = 1.0;
    this.damping = 1.0;
    this.prev = null;
    this.next = null;
  }
}

//manages a collection of rope points and executes
//the integration
export class Rope {
  //generate an array of points suitable for a dynamic
  //rope contour
  static generate(start, end, resolution, mass, damping) {
    const delta = Vector2.sub(end, start);
    const len = Vector2.mag(delta);

    const points = [];
    const pointsLen = len / resolution;

    for (let i = 0; i < pointsLen; i++) {
      const percentage = i / (pointsLen - 1);

      const lerpX = lerp(start.x, end.x, percentage);
      const lerpY = lerp(start.y, end.y, percentage);

      points[i] = new RopePoint({ x: lerpX, y: lerpY }, resolution);
      points[i].mass = mass;
      points[i].damping = damping;
    }

    //Link nodes into a doubly linked list
    for (let i = 0; i < pointsLen; i++) {
      const prev = i != 0 ? points[i - 1] : null;
      const curr = points[i];
      const next = i != pointsLen - 1 ? points[i + 1] : null;

      curr.prev = prev;
      curr.next = next;
    }

    points[0].isFixed = points[points.length - 1].isFixed = true;
    return points;
  }

  constructor(points, solverIterations) {
    this._points = points;
    this.update = this.update.bind(this);
    this._prevDelta = 0;
    this._solverIterations = solverIterations;

    this.getPoint = this.getPoint.bind(this);
  }

  getPoint(index) {
    return this._points[index];
  }

  update(gravity, dt) {
    for (let i = 1; i < this._points.length - 1; i++) {
      const point = this._points[i];

      const accel = { ...gravity };

      RopePoint.integrate(point, accel, dt, this._prevDelta);
    }

    for (let iteration = 0; iteration < this._solverIterations; iteration++)
      for (let i = 1; i < this._points.length - 1; i++) {
        const point = this._points[i];
        RopePoint.constrain(point);
      }

    this._prevDelta = dt;
  }
}
