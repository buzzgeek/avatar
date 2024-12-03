let init = false;
let face = null;
let video;
let faceMesh;
let faces = [];
let triangles;
let showCoords = false;
let noseIndex = 1;
let center = {"x": 320, "y": 240};
let offset = {"x": 0, "y":0};
let features = { 
  "mouth" : {"width": 0, "height": 0, "indecies" : [61, 291,0, 17,],"norm_h" : 0, "min_h": 5, "max_h": 20, "norm_w" : 0, "min_w": 20, "max_w": 60}, 
  "right_eye" : {"width":0, "height": 0, "indecies" : [362, 263, 386, 374,]},
  "left_eye" : {"width":0, "height": 0, "indecies" : [33, 133, 159, 145,]},
  "left_eyebrow" : { "width":0, "height": 0, "indecies" : [9, 383 ,334 ,443 ,], "norm_h" : 0, "min_h": 5, "max_h": 20, "norm_w" : 0, "min_w": 20, "max_w": 60, "flip": false, },
  "right_eyebrow" : {"width":0, "height": 0, "indecies" : [9, 156, 105, 223,], "norm_h" : 0, "min_h": 5, "max_h": 20, "norm_w" : 0, "min_w": 20, "max_w": 60, "flip": true, },
  "nose" : {"origin" : {"x" : 0, "y" : 0 }, 
    "tip" : {"x" : 0, "y" : 0}, 
    "index" : noseIndex, 
    "length" : 0, 
    "max_length" : 50, 
    "norm_length":0,
    "dimensions" : { "w":0, "h":0, "norm_w":0, "norm_h":0, "max_w" : 50, "max_h": 50 },
   },
 };

let lipsExterior = [
    267,
    269,
    270,
    409,
    291,
    375,
    321,
    405,
    314,
    17,
    84,
    181,
    91,
    146,
    61,
    185,
    40,
    39,
    37,
    0,
  ];
// Define the interior lip landmark indices for drawing the inner lip contour
let lipsInterior = [
    13,
    312,
    311,
    310,
    415,
    308,
    324,
    318,
    402,
    317,
    14,
    87,
    178,
    88,
    95,
    78,
    191,
    80,
    81,
    82,
  ];

function preload() {
  faceMesh = ml5.faceMesh({ maxFaces: 1, refinedLandmarks: false, flipped: true });
}

function mousePressed() {
  console.log(faces);
}

// callback function for ai module containing result
function gotFaces(results) {
  faces = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640,480)
  video.hide();
  faceMesh.detectStart(video, gotFaces);
}

function getVectorFeature(item)
{
  // expected item struct --> 
  //  "nose" : {"origin" : {"x" : 0, "y" : 0 }, 
  //    "tip" : {"x" : 0, "y" : 0}, 
  //    "index" : noseIndex, 
  //    "length" : 0, "max_length" : 50, 
  //    "norm_length":0, 
  //    "dimensions" : { "w":0, "h":0, "norm_w":0, "norm_h":0, "max_w" : 10, "max_h": 0 }, 
  //  },
  
  if (face == null) return;

  item.origin.x = round(face.box.xMin + (face.box.width *.5) - offset.x) ;
  item.origin.y = round(face.box.yMin + (face.box.height *.5) - offset.y);
  item.tip.x = round(face.keypoints[item.index].x - offset.x);
  item.tip.y = round(face.keypoints[item.index].y - offset.y);

  let sign = 1;

  if(item.tip.x < item.origin.x){sign = -1;}

  item.length = round(dist(item.origin.x, item.origin.y, item.tip.x, item.tip.y));
  item.length = constrain(item.length, 0, item.max_length);
  item.norm_length = norm(item.length, 0, item.max_length);
  item.length = item.length * sign;
  item.norm_length = item.norm_length * sign;

  //    "dimensions" : { "w":0, "h":0, "norm_w":0, "norm_h":0, "max_w" : 10, "max_h": 0 }, 
  item.dimensions.w = round(item.tip.x - item.origin.x);
  sign = 1;
  if(item.dimensions.w < 0){sign = -1;} 
  item.dimensions.norm_w = norm(abs(item.dimensions.w), 0, item.dimensions.max_w) * sign;
  
  item.dimensions.h = round(item.tip.y - item.origin.y);
  sign = 1;
  if(item.dimensions.h < 0){sign = -1;}
  item.dimensions.norm_h = norm(abs(item.dimensions.h), 0, item.dimensions.max_h) * sign;
}

function drawVectorFeature(item){
  // expected item struct --> "nose" : {"origin" : {"x" : 0, "y" : 0 }, "tip" : {"x" : 0, "y" : 0}, "index" : noseIndex, "length" : 0 },


  stroke(0, 0, 255);
  line(item.origin.x, item.origin.y, item.tip.x, item.tip.y);
  strokeWeight(5);
  point(item.origin.x, item.origin.y);
  point(item.tip.x, item.tip.y);
}

function getNormLengthFeature(item)
  // item structure -->   
  // "left_eyebrow" : { 
  //  "width":0, 
  //  "height": 0, 
  //  "indecies" : [9, 383 ,334 ,443 ,], 
  //  "norm_h" : 0, 
  //  "min_h": 10, 
  //  "max_h": 14, 
  //  "norm_w" : 0, 
  //  "min_w": 40, 
  //  "max_w": 60 },
{
  if(face == null) return;

    // get width length
  let a = face.keypoints[item.indecies[0]];
  let b = face.keypoints[item.indecies[1]];
  let ax = a.x - offset.x;
  let ay = a.y - offset.y;
  let bx = b.x - offset.x;
  let by = b.y - offset.y;
  
  item.width = dist(a.x, a.y, b.x, b.y);
  item.norm_w = norm(item.width, item.min_w, item.max_w);

  // get height length
  a = face.keypoints[item.indecies[2]];
  b = face.keypoints[item.indecies[3]];
  ax = a.x - offset.x;
  ay = a.y - offset.y;
  bx = b.x - offset.x;
  by = b.y - offset.y;

  item.height = dist(a.x, a.y, b.x, b.y);
  item.norm_h = norm(item.height, item.min_h, item.max_h);
}

function getLengthFeature(indecies)
{
  
  if(face == null) return;

  let feat = {"width" : 0, "height": 0};

  // get width length
  let a = face.keypoints[indecies[0]];
  let b = face.keypoints[indecies[1]];
  let ax = a.x - offset.x;
  let ay = a.y - offset.y;
  let bx = b.x - offset.x;
  let by = b.y - offset.y;
  
  feat.width = round(dist(a.x, a.y, b.x, b.y));

  // get height length
  a = face.keypoints[indecies[2]];
  b = face.keypoints[indecies[3]];
  ax = a.x - offset.x;
  ay = a.y - offset.y;
  bx = b.x - offset.x;
  by = b.y - offset.y;

  feat.height = round(dist(a.x, a.y, b.x, b.y));

  return feat;
}

function drawLengthFeatures(indecies)
{
    if (face == null) return;
    
    // get mouth feature
    let a = face.keypoints[indecies[0]];
    let b = face.keypoints[indecies[1]];
    let ax = a.x - offset.x;
    let ay = a.y - offset.y;
    let bx = b.x - offset.x;
    let by = b.y - offset.y;

    stroke(0, 0, 255);
    line(ax, ay, bx, by);
    strokeWeight(5);
    point(ax, ay);
    point(bx, by);

    let feat = dist(a.x, a.y, b.x, b.y);
    noStroke();
    fill(0, 0, 255);
    textSize(24);
    text(round(feat), bx, by);

    a = face.keypoints[indecies[2]];
    b = face.keypoints[indecies[3]];
    ax = a.x - offset.x;
    ay = a.y - offset.y;
    bx = b.x - offset.x;
    by = b.y - offset.y;

    stroke(0, 0, 255);
    line(ax, ay, bx, by);
    strokeWeight(5);
    point(ax, ay);
    point(bx, by);

    feat = dist(a.x, a.y, b.x, b.y);
    noStroke();
    fill(0, 0, 255);
    textSize(24);
    text(round(feat), bx, by);
}


function debug(output){
  noStroke();
  fill(0, 0, 255);
  textSize(24);
  text(output, 50, center.y + 74);
}

function calculateFeatures() {
  
  // get mouth feature
  let feat = getLengthFeature(features.mouth.indecies);
  features.mouth.width = feat.width;
  features.mouth.height = feat.height;

  // get right eye feature
  feat = getLengthFeature(features.right_eye.indecies);
  features.right_eye.width = feat.width;
  features.right_eye.height = feat.height;

  // get left eye feature
  feat = getLengthFeature(features.left_eye.indecies);
  features.left_eye.width = feat.width;
  features.left_eye.height = feat.height;

  // get eye brow features
  getNormLengthFeature(features.right_eyebrow);
  getNormLengthFeature(features.left_eyebrow);

  // get mouth feature
  getNormLengthFeature(features.mouth);

  // get nose feature
  getVectorFeature(features.nose);

}

function drawBoundingBoxes() {
    if(face == null) return;

    fill(255, 255, 255, 100);
    rect(
      face.box.x,
      face.box.y,
      face.box.width,
      face.box.height
    );

    fill(255, 255, 255, 100);
    rect(face.box.xMin, face.box.yMin, face.box.width, face.box.height);
}


// Draw keypoints for specific face element positions
function drawPartsKeypoints() {
    if(face == null) return;

    strokeWeight(2);

    // If there is at least one face
    if (faces.length > 0) {
        // draw face oval
        stroke(0, 0, 255);
        beginShape();
        for (let i = 0; i < face.faceOval.keypoints.length; i++) {
            let keypoint = face.faceOval.keypoints[i];
            let x = (keypoint.x - (face.box.xMin + (face.box.width * .5))) + center.x;
            let y = (keypoint.y - (face.box.yMin + (face.box.height * .5))) + center.y;
            vertex(x, y);

            if(showCoords){
                // display the index
                noStroke();
                fill(255, 0, 0);
                textSize(8);
                text(i, x + 10, y);
            }
        }
        stroke(255, 0, 0);
        fill(255, 200, 0);
        endShape(CLOSE);

        // draw lips
        //noFill();
        fill(255,0,0);
        beginShape();
        for (let i = 0; i < lipsExterior.length; i++) {
            let index = lipsExterior[i];
            let keypoint = faces[0].keypoints[index];
            let x = (keypoint.x - (face.box.xMin + (face.box.width * .5))) + center.x;
            let y = (keypoint.y - (face.box.yMin + (face.box.height * .5))) + center.y;
            vertex(x, y);
        }
        endShape(CLOSE);

        fill(255,200,0);
        beginShape();
        for (let i = 0; i < lipsInterior.length; i++) {
            let index = lipsInterior[i];
            let keypoint = faces[0].keypoints[index];
            let x = (keypoint.x - (face.box.xMin + (face.box.width * .5))) + center.x;
            let y = (keypoint.y - (face.box.yMin + (face.box.height * .5))) + center.y;
            vertex(x, y);
        }
        endShape(CLOSE);

        // draw right eye
        fill(255, 0, 0);
        for (let i = 0; i < face.rightEye.keypoints.length; i++) {
            let rightEye = face.rightEye.keypoints[i];
            let x = (rightEye.x - (face.box.xMin + (face.box.width * .5))) + center.x;
            let y = (rightEye.y - (face.box.yMin + (face.box.height * .5))) + center.y;
            circle(x, y, 5);
        }

        // draw right eye brow
        fill(55, 55, 150);
        for (let i = 0; i < face.rightEyebrow.keypoints.length; i++) {
            let rightEyebrow = face.rightEyebrow.keypoints[i];
            let x = (rightEyebrow.x - (faces[0].box.xMin + (face.box.width * .5))) + center.x;
            let y = (rightEyebrow.y - (faces[0].box.yMin + (face.box.height * .5))) + center.y;
            circle(x, y, 5);
        }

        // draw left eye
        fill(255, 0, 0);
        for (let i = 0; i < face.leftEye.keypoints.length; i++) {
            let leftEye = face.leftEye.keypoints[i];
            let x = (leftEye.x - (face.box.xMin + (face.box.width * .5))) + center.x;
            let y = (leftEye.y - (face.box.yMin + (face.box.height * .5))) + center.y;
            circle(x, y, 5);
        }

        // draw right eye
        fill(55, 55, 150);
        for (let i = 0; i < face.leftEyebrow.keypoints.length; i++) {
            let leftEyebrow = face.leftEyebrow.keypoints[i];
            let x = (leftEyebrow.x - (face.box.xMin + (face.box.width * .5))) + center.x;
            let y = (leftEyebrow.y - (face.box.yMin + (face.box.height * .5))) + center.y;
            circle(x, y, 5);
        }

        // draw tip of nose
        let origin = face.keypoints[noseIndex];
        fill(255, 200, 0);
        let x = (origin.x - (face.box.xMin + (face.box.width * .5))) + center.x;
        let y = (origin.y - (face.box.yMin + (face.box.height * .5))) + center.y;
        strokeWeight(5);
        circle(
            x, 
            y, 
            faces[0].box.width * .1
        );
    }
}

function drawFace()
{
  stroke(0, 0, 255);
  fill(220,220,100);

  let h = face.box.height * .65;
  let w = face.box.width * .65;

  ellipse(center.x, center.y, w, h);
}

function drawEye(eye)
{
  //strokeWeight(10);
  stroke(0, 0, 255);
  fill(220,220,100);
//  ellipse(eye.origin.x, eye.origin.y, eye.w, eye.h);
  let h = features.left_eye.height * 2;
  let w = features.left_eye.width * 1;

  ellipse(eye.origin.x, eye.origin.y, w, h);

  // draw pupil
  fill(0,0,255);
  let x = eye.origin.x + (features.nose.dimensions.norm_w * 10); 
  let y = eye.origin.y + (features.nose.dimensions.norm_h * 10); 
  circle(x, y, w *.3);
}

function drawEyebrow(nose, brow)
{
  // nose structure -->   "nose" : {"origin" : {"x" : 0, "y" : 0 }, 
  // brow structure -->   
  // "left_eyebrow" : { 
  //  "width":0, 
  //  "height": 0, 
  //  "indecies" : [9, 383 ,334 ,443 ,], 
  //  "norm_h" : 0, 
  //  "min_h": 10, 
  //  "max_h": 14, 
  //  "norm_w" : 0, 
  //  "min_w": 40, 
  //  "max_w": 60 
  //  "flip": true},

  //strokeWeight(10);
  stroke(0, 0, 255);
  fill(220,220,100);


  let x_offset = 5;
  let w = lerp(brow.min_w * .3, brow.max_w * .5, brow.norm_w);
  
  if(brow.flip){x_offset = x_offset * -1;}
  
  let x1 = center.x + x_offset;
  let y1 = center.y - (10 + (brow.norm_h * 10)); 
  let x2 = x1 + w;
  if (brow.flip) {x2 = x1 - w;}
  let y2 = y1;
  
  let h = lerp(brow.min_h * .1, brow.max_h * 1.0, brow.norm_h);
  let c_x1 = x1;
  let c_y1 = y1 - h;
  let c_x2 = x2;
  let c_y2 = y2 - h;

  noFill();
  bezier(x1, y1, c_x1, c_y1, c_x2, c_y2, x2, y2);
}

function drawMouth(nose, mouth) {
  // nose structure -->   "nose" : {"origin" : {"x" : 0, "y" : 0 }, 
  // mouth structure -->   "mouth" : {"width": 0, 
  //                                  "height": 0, 
  //                                  "indecies" : [61, 291,0, 17,], 
  //                                  "norm_h" : 0, 
  //                                  "min_h": 5, 
  //                                  "max_h": 20, 
  //                                  "norm_w" : 0, 
  //                                  "min_w": 20, 
  //                                  "max_w": 60}, 
  //strokeWeight(5);
  stroke(0, 0, 255);
  fill(220,220,100);
  let f_w = face.box.width * .2;
  let f_h = face.box.height * .2;

//  let w = (mouth.norm_w * f_w);
  let w = lerp(f_w * .3, f_w, mouth.norm_w);
  let x1 = center.x - w;
  let y1 = center.y + 20; 
  let x2 = x1 + w + w; 
  let y2 = y1;
  
  //line(x1, y1, x2, y2);
//  let h = (mouth.norm_h * f_h);
  let h = lerp(f_h * .1, f_h * 1.0, mouth.norm_h);
  let c_x1 = x1 + 10;
  let c_y1 = y1 + h - 15;
  let c_x2 = x2 - 10;
  let c_y2 = y2 + h - 15;

  fill(0,0,255);
  //beginClip();
  bezier(x1, y1, c_x1, y1 - 4, c_x2, y2 - 4, x2, y2);
  bezier(x1, y1, c_x1, c_y1, c_x2, c_y2, x2, y2);
  //endClip();
}

function draw() {
  background(0, 0, 0);

//  image(video, 0, 0, width, height);
  if (faces.length > 0 && faces[0].lips) {
    face = faces[0];
    calculateFeatures();
    init = true;
    // ml5 base drawing
    //drawBoundingBoxes();
    //drawPartsKeypoints();
  }

  if(init){
    strokeWeight(2);

    // determine drawing offset point based on faces bounding box 
    offset.x = (face.box.xMin + (face.box.width * .5)) - center.x;
    offset.y = (face.box.yMin + (face.box.height * .5)) - center.y;

    drawFace();

    // draw the eyes
    let gap = features.left_eye.width * .7;
    let rightEye = {"origin" : {"x": center.x - gap, "y": center.y}, "w": 20, "h": 40};
    drawEye(rightEye);
    let leftEye = {"origin" : {"x": center.x + gap, "y": center.y}, "w": 20, "h": 40};
    drawEye(leftEye);

    // draw the eye brows
    drawEyebrow(features.nose, features.right_eyebrow);
    drawEyebrow(features.nose, features.left_eyebrow);

    // draw the mouth
    drawMouth(features.nose, features.mouth);

    // draw nose
//    drawVectorFeature(features.nose);
  }

}

  