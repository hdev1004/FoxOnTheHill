class circle {
    constructor(color, total, speed, n) {
        this.canvas = document.querySelector(".canvas");
        this.ctx = this.canvas.getContext("2d");
        this.total = total;
        this.speed = speed;
        this.color = color;
        this.points = [];
        this.curve = [];
        this.plusEvnet = [];
        this.n = n;
        
        this.canvas.width = document.body.clientWidth;
        this.canvas.height = document.body.clientHeight;
        this.gap = Math.ceil(this.canvas.width / (this.total - 4));
        console.log(this.gap);

        for(let i = 0; i < this.n; i ++) {
            this.plusEvnet[i] = 0;
        }
        
        for(let i = 0; i < this.total; i ++) {
            this.points[i] = {
                x: this.gap,
                y: this.getRandomInt(100, this.canvas.height)
            };
        }

        for(let i = 0; i < this.total - 1; i ++) {
            this.curve[i] = {
                x: this.points[i].x + (this.gap / 2),
                y: (this.points[i].y + this.points[i+1].y) / 2
            };
        }


        window.addEventListener("resize", this.resize.bind(this), false);

        this.resize();
        this.draw();
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
      }

    resize() {
        this.canvas.width = document.body.clientWidth;
        this.canvas.height = document.body.clientHeight;
        console.log("resize Height : " + this.canvas.height);

        this.gap = Math.ceil(this.canvas.width / (this.total - 4));
        for(let i = 0; i < this.total; i ++) {
            this.points[i] = {
                x: this.gap * (i - 1),
                y: this.points[i].y
            };
        }
        for(let i = 0; i < this.total - 1; i ++) {
            this.curve[i] = {
                x: this.points[i].x + (this.gap / 2),
                y: (this.points[i].y + this.points[i+1].y) / 2
            };
        }

        this.draw();
    }

    draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        for(let i = 0; i < this.total; i ++) {
            //this.ctx.arc(this.points[i].x, this.points[i].y, 10, 0, Math.PI * 2);
            //this.ctx.lineTo(this.points[i].x, this.points[i].y);
            //if(i < this.total - 1) {
            //    this.ctx.lineTo(this.curve[i].x, this.curve[i].y);
           // }
            if(i < this.total - 1)
            this.ctx.quadraticCurveTo(this.points[i].x, this.points[i].y, this.curve[i].x, this.curve[i].y);
        }
        this.ctx.lineTo(this.points[this.total - 1].x, this.canvas.height);
        this.ctx.lineTo(this.points[0].x, this.canvas.height);
        this.ctx.lineTo(this.points[0].x, this.points[0].y);
        //this.ctx.stroke();
        this.ctx.fill();
    }

    animate(t) {
        requestAnimationFrame(this.animate.bind(this));
        for(let i = 0; i < this.total; i ++) {
            this.points[i].x += this.speed;
            if(i < this.total - 1) {
                this.curve[i].x += this.speed;
            }
        }
        if(this.points[this.total - 1].x >= this.canvas.width + this.gap * 2) {
            this.points.pop();
            this.points.unshift({
                x: -this.gap * 2,
                y: this.getRandomInt(100, this.canvas.height - 100)
            });

            this.curve.pop();
            this.curve.unshift({
                x: this.points[0].x + (this.gap / 2),
                y: (this.points[0].y + this.points[1].y) / 2
            })

            for(let i = 0; i < this.n; i ++) {
                this.plusEvnet[i] += 1;
            }
        }
        this.draw();
    }
}

class run {
    constructor(hills, x, speed, scale, idx, nowMotion) {
        this.idx = idx; //몇번째 여우인지 확인
        this.img = new Image();
        this.img.src = "img/fox_cut.png";

        this.canvas = document.querySelector(".canvas");
        this.ctx = this.canvas.getContext("2d");
        this.hills = hills;
        this.time = 0;
        this.total = 87;
        this.getHillPoints = hills.points;
        this.getHillCurve = hills.curve;
        this.plus = 0;

        this.speed = speed;
        this.nowMotion = nowMotion;
        this.fps = 60 / 10;
        this.nowFps = 0;
        this.x = x;
        this.scale = scale;


        
    }

    getQuadObj(t, x1, cx, x2, y1, cy, y2) {
        let tx = this.getQuadTangent(t, x1, cx, x2);
        let ty = this.getQuadTangent(t, y1, cy, y2);
        let rotation = -Math.atan2(tx, ty) + (90 * Math.PI / 180);
        return {
            x:Math.ceil(this.getQuadValue(t, x1, cx, x2)),
            y:Math.ceil(this.getQuadValue(t, y1, cy, y2)),
            rotation: rotation
        };
    }
    getQuadValue(t, p0, p1, p2) { //0~1
        return (((1 - t) * (1 - t)) * p0) + ((2 * (1 - t)) * (t * p1)) + (t * t * p2);
    }

getQuadTangent(t, a, b, c) {
    return 2 * (1 - t) * (b - a) + 2 * (c - b) * t
}

    getY(x) {
        try {
            let pos = Math.floor(x / this.hills.gap) + this.hills.plusEvnet[this.idx];
            let t = (((x + ((this.hills.plusEvnet[this.idx] - 1) * this.hills.gap)) - ((pos - 1) * this.hills.gap)) / this.hills.gap);
            //console.log(pos);
            if(pos < this.hills.total - 2) {
                let getQuad = this.getQuadObj(t, this.getHillCurve[pos].x, this.getHillPoints[pos+1].x, this.getHillCurve[pos+1].x, this.getHillCurve[pos].y, this.getHillPoints[pos+1].y, this.getHillCurve[pos+1].y);
               //width : 302
               //height : 117
               this.ctx.fillStyle = "black";
                this.ctx.save();
                this.ctx.translate(getQuad.x, getQuad.y);
                this.ctx.rotate(getQuad.rotation);
                //this.ctx.fillRect(-50, -100, 100, 100);
                this.ctx.scale(-1, 1);
                this.ctx.scale(this.scale, this.scale);
                this.ctx.drawImage(this.img, 0, 117*this.nowMotion, 302, 117, -50, -105, 302, 117);
                this.ctx.restore();
            }
        } catch(err) {
        }
      
        return 0;
    }

    draw() {
        let get1 = this.getY(this.x);
        this.x += this.speed;
        
        this.nowFps += 1;
        if(this.nowFps >= this.fps) {
            this.nowMotion += 1;
            if(this.nowMotion >= 6) this.nowMotion = 0;
            this.nowFps = 0;
        }

        if((this.x + ((this.hills.plusEvnet[this.idx] - 1) * this.hills.gap))> this.canvas.width + this.hills.gap * 2) {
            console.log(this.x);
            this.hills.plusEvnet[this.idx] = 0;
            this.x = 0;
        }
        
        //for(let i = 0; i <= 1; i += (1/this.total)) {
            //let getQuad = this.getQuadObj(i, this.getHillCurve[pos].x, this.getHillPoints[pos+1].x, this.getHillCurve[pos+1].x, this.getHillCurve[pos].y, this.getHillPoints[pos+1].y, this.getHillCurve[pos+1].y);
            
        //}
    
    }

    animate(t) {
        requestAnimationFrame(this.animate.bind(this));
        this.draw();
    }
}

window.onload = () => {
    let canvas = document.querySelector(".canvas");
    let ctx = canvas.getContext("2d");
    
    //Height위치, 개수, 스피드
    let c = [
        new circle("#f3dfdb", 30, 0.1, 0),
        new circle("#bbdefb", 20, 0.3, 2),
        new circle("#b2dfdb", 15, 0.5, 2),
        new circle("#f3e5f5", 20, 1, 2)
    ];
    clearAnimate();
    
    function clearAnimate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        requestAnimationFrame(clearAnimate);
    }

    let r = [
    [

    ],[
        new run(c[1], -100, 0.5, 0.3, 0, 1),
        new run(c[1], 50, 0.4, 0.3, 1, 4),
    ], [
        new run(c[2], -100, 0.7, 0.5, 0, 3),
        new run(c[2], 0, 0.6, 0.5, 1, 0),
    ], [
        new run(c[3], 0, 1, 0.7, 0, 0),
        new run(c[3], -100, 1, 0.7, 1, 1),
    ]];

    for(let i = 0; i < c.length; i ++) {
        c[i].animate();
        for(let j = 0; j < r[i].length; j ++) {
            r[i][j].animate();
        }
    }

        
}
