//load kNear
k = 3
const knn = new kNear(5)

window.onload = learn()

let rockPaperScissors = ["👊", "🖐", "✌️"]
let message = ['system', 'you are a rock paper scissors api so you should only reply with only one of the following awnsers: "rock", "paper", "scissors", you should respond when you get this message and only with one of the following awnsers: "rock", "paper", "scissors"']

// holds handpose model object
let model;

// holds context object
let ctx;
let ctxlog;
let video = document.getElementById("videoElement");
let canvas = document.getElementById("canvasElement");

const VIDEO_WIDTH = 600
const VIDEO_HEIGHT = 420

let togeleDataElement = document.getElementById("dataLog") 
togeleDataElement.addEventListener("click", logLearnedData)

let togeledatalogElement = document.getElementById("logpredictionarray") 
togeledatalogElement.addEventListener("click", logpredarray)

let gameBtn = document.getElementById("startGame") 
gameBtn.addEventListener("click", countdown)
let consoleData = false
let gamePrediction

let countdownElement = document.getElementById("countdown")
let aipredictElement = document.getElementById("aipredict")
let scoreElement = document.getElementById("score")

let countdownStarted = false
let globalPoseData
let loggingOverlay = false
let loggingLandmarks

let score = 0
let logdataIndex = 0
let posekeyIndex = 0

// finger points
let fingerLookupIndices = {
    thumb: [0, 1, 2, 3, 4],
    indexFinger: [0, 5, 6, 7, 8],
    middleFinger: [0, 9, 10, 11, 12],
    ringFinger: [0, 13, 14, 15, 16],
    pinky: [0, 17, 18, 19, 20]
}

// draw the skeleton of the hand from learned landmarks
function logLearnedData() {
    ctxlog = canvas.getContext('2d');


    let posekey = Object.keys(globalPoseData)[posekeyIndex]
    if (logdataIndex > globalPoseData[posekey].length - 1) {
        logdataIndex = 0
        posekeyIndex++
        if (posekeyIndex > Object.keys(globalPoseData).length - 1) {
            posekeyIndex = 0
            loggingOverlay = false
            togeleDataElement.innerText = "Log Data"
        }
        posekey = Object.keys(globalPoseData)[posekeyIndex]
    }
    let landmarks = []
        for (let i = 0; i < globalPoseData[posekey][logdataIndex].length; i += 3) {
            landmarks.push([
                globalPoseData[posekey][logdataIndex][i],
                globalPoseData[posekey][logdataIndex][i+ 1],
                globalPoseData[posekey][logdataIndex][i+ 2]
            ])
        }
    console.log(logdataIndex, posekeyIndex)
    if (logdataIndex == 0 && posekeyIndex == 0) {
        console.log("loggingsdasdasd")
        loggingOverlay = true
    }

    loggingLandmarks = landmarks

        console.log(landmarks)
        displayHandSkeletonLogData(landmarks)

        console.log(`Key: ${globalPoseData[posekey][logdataIndex]}`);
        togeleDataElement.innerText = "Data: " + emojiFier(posekey) + " pose: " + logdataIndex
    logdataIndex++
}

// landmarks is an array of 3D coordinates predicted by the Handpose model
function displayHandSkeleton(landmarks) {
    // console.log (landmarks)
    for (let i = 0; i < landmarks.length; i++) {
        const y = landmarks[i][0];
        const x = landmarks[i][1];

        drawPoint(x, y)
    }

    const fingers = Object.keys(fingerLookupIndices)

    for (let i = 0; i < fingers.length; i++) {
        const finger = fingers[i]
        const points = fingerLookupIndices[finger].map(idx => landmarks[idx])
        drawPath(points)
    }
}

function displayHandSkeletonLogData(landmarks) {
    for (let i = 0; i < landmarks.length; i++) {
        const y = landmarks[i][0];
        const x = landmarks[i][1];

        drawPointLogData(x, y)
    }

    const fingers = Object.keys(fingerLookupIndices)

    for (let i = 0; i < fingers.length; i++) {
        const finger = fingers[i]
        const points = fingerLookupIndices[finger].map(idx => landmarks[idx])
        drawPathLogData(points)
    }
}

function toggleData() {
    if (consoleData != true) {
        consoleData = true
    } else {
        consoleData = false
    }
}

async function predict() {
    // draw the frames obtained from video stream on a canvas
    ctx.drawImage(video, 0, 0, canvas.clientWidth, canvas.height);

    if (loggingOverlay) {
        console.log("logging")
        displayHandSkeletonLogData(loggingLandmarks)
    }

    // predict landmarks on hand (3D) in the frame of a video
    const predictions = await model.estimateHands(video);

    if (predictions.length > 0) {
        const landmarks = predictions[0].landmarks;
        // console.log(predictions)
        displayHandSkeleton(landmarks)

        if (consoleData === true) {
            logData(predictions)
        }
        knnPredict(predictions)
    }

    requestAnimationFrame(predict);
}

async function playGame(gamePrediction) {
    // Randomly select an entry from the array
    // const computerChoice = rockPaperScissors[Math.floor(Math.random() * rockPaperScissors.length)];

    // Get the prediction
    // const userChoice = predict();
    
    
    let userChoice = gamePrediction
    if (userChoice === undefined) {
        userChoice = "rock"
        }
        
        const computerChoice = await getAiPrediction() 
        
        message.push(['user', userChoice])
        
        aipredictElement.innerText = "AI: " + emojiFier(computerChoice)

    // Determine the winner
    console.log(userChoice, computerChoice)
    if (userChoice === computerChoice) {
        return 'It\'s a tie!';
    } else if (
        (userChoice === 'rock' && computerChoice === 'scissors') ||
        (userChoice === 'scissors' && computerChoice === 'paper') ||
        (userChoice === 'paper' && computerChoice === 'rock')
    ) {
        return 'User wins!';
    } else {
        return 'Computer wins!';
    }
}

function deEmojiFier(emoji) {
    switch (emoji) {
        case '👊':
            return 'rock';
        case '🖐':
            return 'paper';
        case '✌️':
             return'scissors';
    }
}
function emojiFier(name) {
    switch (name) {
        case 'rock':
            return'👊';
        case 'paper':
            return '🖐';
        case 'scissors':
            return '✌️';
    }
}

function test () {
    console.log("test")

}

function countdown() {
    if (!countdownStarted) {
        countdownStarted = true
        aipredictElement.innerText = "" 
        console.log('Starting countdown...');
        let remaining = 3;
    
        const intervalId = setInterval(async () => {
            console.log(`Time remaining: ${remaining} seconds`);
    
            countdownElement.classList.add("countdownstart")
            countdownElement.innerText = remaining;
            remaining--;
            
            if (remaining < 0) {
                clearInterval(intervalId);
                countdownElement.classList.remove("countdownstart")
                countdownElement.innerText = "GO!"
                console.log('Countdown complete!');
                countdownStarted = false
                result = await playGame(gamePrediction);
                
                if (result === "User wins!") {
                    score++
                    scoreElement.innerText = "Score: " + score
                    countdownElement.innerText = "You win!"
                } else if (result === "Computer wins!") {
                    countdownElement.innerText = "Computer wins!"
                } else {
                    countdownElement.innerText = "It's a tie!"
                }
            }
        }, 1000);
    }
}

fetch('../posedata/poseData1.json').then(response => response.json()).then((poseData) => {
    globalPoseData = poseData
})

// draw point in fingers
function drawPoint(y, x) {
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, 2 * Math.PI)
    ctx.fill()
}
function drawPointLogData(y, x) {
    ctxlog.beginPath()
    ctxlog.arc(x, y, 3, 0, 2 * Math.PI)
    ctxlog.fill()
}

// draw line between points in fingers
function drawPath(points) {
    const region = new Path2D()
    region.moveTo(points[0][0], points[0][1])

    for (let i = 1; i < points.length; i++) {
        const point = points[i]
        region.lineTo(point[0], point[1])
    }

    if (false) {
        region.closePath()
    }
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.stroke(region)
}

function drawPathLogData(points) {
    const region = new Path2D()
    region.moveTo(points[0][0], points[0][1])

    for (let i = 1; i < points.length; i++) {
        const point = points[i]
        region.lineTo(point[0], point[1])
    }

    if (false) {
        region.closePath()
    }
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 3;
    ctx.stroke(region)
}

function logData(predictions) {
    let str = ""

    for (let i = 0; i < 20; i++) {
        str += predictions[0].landmarks[i][0] + ", " + predictions[0].landmarks[i][1] + ", " + predictions[0].landmarks[i][2] + ", "
    }

    const log = document.getElementById("outcome")

    log.innerText = str
}

// start the webcam and play it
function startCam() {
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ 
            video: {
                width: VIDEO_WIDTH,
                height: VIDEO_HEIGHT
            },
            audio: false
        })
            .then(stream => {
                // assign video stream to element
                video.srcObject = stream;

                // start playing video
                video.play();
            })
            .catch(e => {
                console.log(`Error in video stream!: ${e}`)
            });
    }

    video.onloadedmetadata = () => {

        let videoWidth = video.videoWidth
        let videoHeight = video.videoHeight

        canvas.width = videoWidth
        canvas.height = videoHeight

        // get the 2D graphics context from the canvas
        ctx = canvas.getContext('2d');

        video.width = videoWidth
        video.height = videoHeight

        ctx.strokeStyle = "black"
        ctx.fillStyle = "black"

        // reset the point (0,0) to a given point
        ctx.translate(canvas.width, 0);

        // flip the context
        ctx.scale(-1, 1);

        // start the preciction indefinitely on the video stream
        requestAnimationFrame(predict);
    }
}

async function getAiPrediction() {
    return new Promise(async (resolve, reject) => {
        // await fetch('https://192.168.1.128:3010/RPS', {
        await fetch('https://thimodehaan.com:3010/RPS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: message })
      }).then(async (res) => {
        let smessage = await res.text()
        console.log(smessage)
        message.push(['ai', `${smessage}`])
        resolve(smessage.toLowerCase())
      }).catch((err) => {
        console.log(err)
        resolve("rock")
      })
    })
}
let predarray = []

function knnPredict(predictions) {
    let predictP = document.getElementById("predict")

    // console.log(predictions)

    let array = []

    for (let i = 0; i <= 20; i++) {
        array.push(predictions[0].landmarks[i][0])
        array.push(predictions[0].landmarks[i][1])
        array.push(predictions[0].landmarks[i][2])
    }
    let prediction = knn.classify(array)
    if (predarray[prediction] === undefined) {
        predarray[prediction] = []
    } else {
        predarray[prediction].push(array)
    }

    // console.log(predarray)

    // console.log(JSON.stringify({ [prediction]: [fixedarray]}))

    console.log(`I think this is a ${emojiFier(prediction)}`)
    predictP.innerHTML = "You:  " +  emojiFier(prediction)
    gamePrediction = prediction
}

function logpredarray() {
    console.log(predarray)
}

async function main() {
    // load the model
    model = await handpose.load()

    // start the webcam and play it
    startCam()

    // test array
    // console.log([270.5660214031216, 411.8369952697544, -0.001538001000881195, 356.88455570482733, 374.19584580572985, -12.903488159179688, 409.0685080608857, 314.9186339394451, -22.881078720092773, 447.2424181331987, 265.18326477080245, -32.877769470214844, 470.8353446569099, 229.46794232523214, -43.58822250366211, 347.36858486416725, 212.47737606657557, -19.144542694091797, 366.454836626725, 137.26341251985832, -34.945491790771484, 390.7931445034823, 120.8114882524117, -50.95320129394531, 410.5141255548896, 126.27019929817973, -61.75347137451172, 292.93631434583426, 217.71221556499106, -21.65037727355957, 281.7593078909498, 133.3605058140492, -39.1291389465332, 310.3410156893583, 129.32199719810416, -57.83729553222656, 341.1158926890839, 149.70084770995072, -71.25668334960938, 243.8494011053367, 242.93992061705936, -25.493654251098633, 222.63925251886405, 176.4956241951498, -42.121788024902344, 250.85924135407254, 180.69371962551503, -59.76639938354492, 281.9564079844801, 202.99484173316105, -71.25849151611328, 203.2145605559949, 282.64826798130184, -30.121143341064453, 180.8954019257549, 248.35711715370923, -44.90850067138672, 197.1715007338897, 247.6995928389119, -58.01225662231445,])
}

function learn() {
    fetch('https://raw.githubusercontent.com/ThatGuyThimo/pro-2-8-pose/refs/heads/main/posedata/poseData.json').then(response => response.json()).then((poseData) => {
        // globalPoseData = poseData
        for (let key in poseData) {
            console.log(`Key: ${key}`);
            for (let i = 0; i < poseData[key].length; i++) {
            //   console.log(`Element ${i} in array ${key}: ${poseData[key][i]}`);
                knn.learn(poseData[key][i], key)
            }
          }
    })
}

main()