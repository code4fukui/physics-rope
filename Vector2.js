export class Vector2 {
	constructor(x, y) {
		this.x = x ?? 0;
		this.y = y ?? 0;
	}
	static zero() {
		return new Vector2();
	}
	static sub(v1, v2) {
	 	return new Vector2(v1.x - v2.x, v1.y - v2.y); 
	}
	static add(v1, v2) {
	 	return new Vector2(v1.x + v2.x, v1.y + v2.y); 
	}
	static mag(v) {
		return Math.sqrt(v.x * v.x + v.y * v.y);
	}
	static normalized(v) {
		const len = Vector2.mag(v);
		const res = new Vector2(v.x / len, v.y / len);
		return res;
	}
	static dot(a, b) {
		let n = 0;
		for (let i = 0; i < a.length; i++) {
			n += a[i] * b[i];
		}
		return n;
	}
	static similarity(a, b) {
	  return Vector2.dot(a, b) / (Math.sqrt(Vector2.dot(a, a)) * Math.sqrt(Vector2.dot(b, b)));
	};
}
