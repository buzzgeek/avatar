let video;
let faceMesh;
let faces = [];
let triangles;
let showCoords = false;
let noseIndex = 1;
let center = {"x": 320, "y": 240};
let offset = {"x": 0, "y":0};
let features = { 
  "mouth" : {"width": 0, "height": 0, "indecies" : [61, 291,0, 17,]}, 
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
  
  item.origin.x = round(faces[0].box.xMin + (faces[0].box.width *.5) - offset.x) ;
  item.origin.y = round(faces[0].box.yMin + (faces[0].box.height *.5) - offset.y);
  item.tip.x = round(faces[0].keypoints[item.index].x - offset.x);
  item.tip.y = round(faces[0].keypoints[item.index].y - offset.y);

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
    // get width length
  let a = faces[0].keypoints[item.indecies[0]];
  let b = faces[0].keypoints[item.indecies[1]];
  let ax = a.x - offset.x;
  let ay = a.y - offset.y;
  let bx = b.x - offset.x;
  let by = b.y - offset.y;
  
  item.width = round(dist(a.x, a.y, b.x, b.y));
  item.norm_w = norm(item.width, item.min_w, item.max_w);

  // get height length
  a = faces[0].keypoints[item.indecies[2]];
  b = faces[0].keypoints[item.indecies[3]];
  ax = a.x - offset.x;
  ay = a.y - offset.y;
  bx = b.x - offset.x;
  by = b.y - offset.y;

  item.height = round(dist(a.x, a.y, b.x, b.y));
  item.norm_h = norm(item.height, item.min_h, item.max_h);
}

function getLengthFeature(indecies)
{
  let feat = {"width" : 0, "height": 0};

  // get width length
  let a = faces[0].keypoints[indecies[0]];
  let b = faces[0].keypoints[indecies[1]];
  let ax = a.x - offset.x;
  let ay = a.y - offset.y;
  let bx = b.x - offset.x;
  let by = b.y - offset.y;
  
  feat.width = round(dist(a.x, a.y, b.x, b.y));

  // get height length
  a = faces[0].keypoints[indecies[2]];
  b = faces[0].keypoints[indecies[3]];
  ax = a.x - offset.x;
  ay = a.y - offset.y;
  bx = b.x - offset.x;
  by = b.y - offset.y;

  feat.height = round(dist(a.x, a.y, b.x, b.y));

  return feat;
}

function drawLengthFeatures(indecies)
{
    // get mouth feature
    let a = faces[0].keypoints[indecies[0]];
    let b = faces[0].keypoints[indecies[1]];
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

    a = faces[0].keypoints[indecies[2]];
    b = faces[0].keypoints[indecies[3]];
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

  // get right eye feature
  feat = getLengthFeature(features.right_eyebrow.indecies);
  features.right_eyebrow.width = feat.width;
  features.right_eyebrow.height = feat.height;

  getNormLengthFeature(features.right_eyebrow);
  getNormLengthFeature(features.left_eyebrow);

  // get left eye feature
  feat = getLengthFeature(features.left_eyebrow.indecies);
  features.left_eyebrow.width = feat.width;
  features.left_eyebrow.height = feat.height;

  
   getVectorFeature(features.nose);
   drawVectorFeature(features.nose);

  //  drawLengthFeatures(features.mouth.indecies);
  //  drawLengthFeatures(features.right_eye.indecies);
  //  drawLengthFeatures(features.left_eye.indecies);
  //  drawLengthFeatures(features.right_eyebrow.indecies);
  //  drawLengthFeatures(features.left_eyebrow.indecies);

   let rightEye = {"origin" : {"x": center.x - 25, "y": center.y}, "w": 40, "h": 50};
   drawEye(rightEye);
   let leftEye = {"origin" : {"x": center.x + 25, "y": center.y}, "w": 40, "h": 50};
   drawEye(leftEye);

}

function drawBoundingBoxes() {
    fill(255, 255, 255, 100);
    rect(
      faces[0].box.x,
      faces[0].box.y,
      faces[0].box.width,
      faces[0].box.height
    );

    fill(255, 255, 255, 100);
    rect(faces[0].box.xMin, faces[0].box.yMin, faces[0].box.width, faces[0].box.height);
}


// Draw keypoints for specific face element positions
function drawPartsKeypoints() {
    strokeWeight(2);

    // If there is at least one face
    if (faces.length > 0) {
        // draw face oval
        stroke(0, 0, 255);
        beginShape();
        for (let i = 0; i < faces[0].faceOval.keypoints.length; i++) {
            let keypoint = faces[0].faceOval.keypoints[i];
            let x = (keypoint.x - (faces[0].box.xMin + (faces[0].box.width * .5))) + center.x;
            let y = (keypoint.y - (faces[0].box.yMin + (faces[0].box.height * .5))) + center.y;
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
            let x = (keypoint.x - (faces[0].box.xMin + (faces[0].box.width * .5))) + center.x;
            let y = (keypoint.y - (faces[0].box.yMin + (faces[0].box.height * .5))) + center.y;
            vertex(x, y);
        }
        endShape(CLOSE);

        fill(255,200,0);
        beginShape();
        for (let i = 0; i < lipsInterior.length; i++) {
            let index = lipsInterior[i];
            let keypoint = faces[0].keypoints[index];
            let x = (keypoint.x - (faces[0].box.xMin + (faces[0].box.width * .5))) + center.x;
            let y = (keypoint.y - (faces[0].box.yMin + (faces[0].box.height * .5))) + center.y;
            vertex(x, y);
        }
        endShape(CLOSE);

        // draw right eye
        fill(255, 0, 0);
        for (let i = 0; i < faces[0].rightEye.keypoints.length; i++) {
            let rightEye = faces[0].rightEye.keypoints[i];
            let x = (rightEye.x - (faces[0].box.xMin + (faces[0].box.width * .5))) + center.x;
            let y = (rightEye.y - (faces[0].box.yMin + (faces[0].box.height * .5))) + center.y;
            circle(x, y, 5);
        }

        // draw right eye brow
        fill(55, 55, 150);
        for (let i = 0; i < faces[0].rightEyebrow.keypoints.length; i++) {
            let rightEyebrow = faces[0].rightEyebrow.keypoints[i];
            let x = (rightEyebrow.x - (faces[0].box.xMin + (faces[0].box.width * .5))) + center.x;
            let y = (rightEyebrow.y - (faces[0].box.yMin + (faces[0].box.height * .5))) + center.y;
            circle(x, y, 5);
        }

        // draw left eye
        fill(255, 0, 0);
        for (let i = 0; i < faces[0].leftEye.keypoints.length; i++) {
            let leftEye = faces[0].leftEye.keypoints[i];
            let x = (leftEye.x - (faces[0].box.xMin + (faces[0].box.width * .5))) + center.x;
            let y = (leftEye.y - (faces[0].box.yMin + (faces[0].box.height * .5))) + center.y;
            circle(x, y, 5);
        }

        // draw right eye
        fill(55, 55, 150);
        for (let i = 0; i < faces[0].leftEyebrow.keypoints.length; i++) {
            let leftEyebrow = faces[0].leftEyebrow.keypoints[i];
            let x = (leftEyebrow.x - (faces[0].box.xMin + (faces[0].box.width * .5))) + center.x;
            let y = (leftEyebrow.y - (faces[0].box.yMin + (faces[0].box.height * .5))) + center.y;
            circle(x, y, 5);
        }

        // draw tip of nose
        let origin = faces[0].keypoints[noseIndex];
        fill(255, 200, 0);
        let x = (origin.x - (faces[0].box.xMin + (faces[0].box.width * .5))) + center.x;
        let y = (origin.y - (faces[0].box.yMin + (faces[0].box.height * .5))) + center.y;
        strokeWeight(5);
        circle(
            x, 
            y, 
            faces[0].box.width * .1
        );
    }
}

function drawEye(eye)
{
  stroke(0, 0, 255);
  fill(220,220,100);
  ellipse(eye.origin.x, eye.origin.y, eye.w, eye.h);

  // draw pupil
  fill(0,0,255);
  let x = eye.origin.x + (features.nose.dimensions.norm_w * 10); 
  let y = eye.origin.y + (features.nose.dimensions.norm_h * 10); 
  circle(x, y + 4, 22);
}

function drawEyebrow(nose, brow)
{
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

  strokeWeight(10);
  stroke(0, 0, 255);
  fill(220,220,100);


  let x_offset = 10;
  
  if(brow.flip){x_offset = x_offset * -1;}
  
  let x1 = nose.origin.x + x_offset;
  let y1 = nose.origin.y - (30 + (brow.norm_h * 10)); 
  let x2 = x1 + 40; // + (brow.norm_w * 10);
  if (brow.flip) {x2 = x1 - 40;}
  let y2 = y1;
  
  //line(x1, y1, x2, y2);
  let v = (brow.norm_h * 20);
  let c_x1 = x1;
  let c_y1 = y1 - v;
  let c_x2 = x2;
  let c_y2 = y2 + v;

  noFill();
  bezier(x1, y1, c_x1, c_y1, x2, y2, c_x2, c_y2);
//  curve(c_x1, c_y1, x1, y1, c_x2, c_y2, x2, y2);

  //debug(JSON.stringify(brow));

}

function draw() {
  background(0, 0, 0);

//  image(video, 0, 0, width, height);
  if (faces.length > 0 && faces[0].lips) {
    offset.x = (faces[0].box.xMin + (faces[0].box.width * .5)) - center.x;
    offset.y = (faces[0].box.yMin + (faces[0].box.height * .5)) - center.y;
    drawPartsKeypoints();
    calculateFeatures();
//    drawBoundingBoxes();

    drawEyebrow(features.nose, features.right_eyebrow);
    drawEyebrow(features.nose, features.left_eyebrow);

  }
}

  