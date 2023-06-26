const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const next = require('next');
const fs = require('fs');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({dev});
const nextHandler = nextApp.getRequestHandler();
let interval;
const teams = require('./config');
const {StateManager} = require('./StateManager');

const getApiAndEmit = (socket) => {
    const response = new Date();
    socket.emit("FromAPI", response);
};

//////////////////////////// New //////////////////////////////

let teamGroupOne = null
let teamGroupTwo = null

const themeTimer = 5000
let randomTheme = null;
let numberOfChosenAnimals = 0
let numberOfButtonClicked = 0;
let numberOfAnimationQuestionAnswered = 0
let IdOfAnimationQuestionAnswered = []
let numberOfCardsView = 0;
let isFinalQuestionIsCorrect = true
let isInformationUnderstood = 0
let animalChosenValue = null;


const animals = {
    "Mutualisme": {
        "teamGroupOne": {
            "animals": [
                {
                    "name": "Biche",
                    "icon": "biche.svg",
                    "fullName" : "La biche"
                },
                {
                    "name": "Truite",
                    "icon": "ours.svg",
                    "fullName" : "L'ours"
                },
                {
                    "name": "Renard",
                    "icon": "renard.svg",
                    "fullName" : "Le renard"
                },
                {
                    "name": "Salamandre",
                    "icon": "salamandre.svg",
                    "fullName" : "La salamandre"
                },
                {
                    "name": "Marmotte",
                    "icon": "marmotte.svg",
                    "fullName" : "La marmotte"
                },
                {
                    "name": "Cerf",
                    "icon": "cerf.svg",
                    "fullName" : "Le cerf"
                },
                {
                    "name": "Crapaud",
                    "icon": "crapaud.svg",
                    "fullName" : "Le crapaud"
                },
                {
                    "name": "Loup",
                    "icon": "loup.svg",
                    "fullName" : "Le loup"
                },
                {
                    "name": "Lapin",
                    "icon": "lapin.svg",
                    "fullName" : "Le lapin"
                },
                {
                    "name": "Aigle",
                    "icon": "aigle.svg",
                    "fullName" : "L'aigle"
                }
            ],
            "answer": 7
        },
        "teamGroupTwo": {
            "animals": [
                {
                    "name": "Lézard",
                    "icon": "ours.svg",
                    "fullName" : "Le lézard"
                },
                {
                    "name": "Biche",
                    "icon": "biche.svg",
                    "fullName" : "La biche"
                },
                {
                    "name": "Hibou",
                    "icon": "ours.svg",
                    "fullName" : "Le hibou"
                },
                {
                    "name": "Papillon",
                    "icon": "ours.svg",
                    "fullName" : "Le papillon"
                },
                {
                    "name": "Corbeau",
                    "icon": "ours.svg",
                    "fullName" : "Le corbeau"
                },
                {
                    "name": "Coccinelle",
                    "icon": "ours.svg",
                    "fullName" : "La coccinelle"
                },
                {
                    "name": "Faucon",
                    "icon": "ours.svg",
                    "fullName" : "Le faucon"
                },
                {
                    "name": "Chouette",
                    "icon": "ours.svg",
                    "fullName" : "La chouette"
                },
                {
                    "name": "Rat",
                    "icon": "ours.svg",
                    "fullName" : "Le rat"
                },
                {
                    "name": "Loup",
                    "icon": "loup.svg",
                    "fullName" : "Le loup"
                }
            ],
            "answer": 4
        }
    },
};

const answersAnimation = {
    "Mutualisme": {
        "time": 5,
        "question": "Qu'avez vous compris ?",
        "answers": ["Les animaux se mangent entre eux", "Les animaux se nourrissent les uns des autres", "Les animaux se protègent les uns des autres", "Les animaux se reproduisent entre eux"],
        "correctAnswer": 1
    },
    "Predation": {
        "time": 5,
        "question": "Qu'avez vous compris ?",
        "answers": ["Les animaux se mangent entre eux", "Les animaux se nourrissent les uns des autres", "Les animaux se protègent les uns des autres", "Les animaux se reproduisent entre eux"],
        "correctAnswer": 2
    },
    "Commensalisme": {
        "time": 5,
        "question": "Qu'avez vous compris ?",
        "answers": ["Les animaux se mangent entre eux", "Les animaux se nourrissent les uns des autres", "Les animaux se protègent les uns des autres", "Les animaux se reproduisent entre eux"],
        "correctAnswer": 3
    }
}


let clientConnected = {client: false, client2: false};

const stateManager = new StateManager();
const themes = ['Mutualisme', 'Predation', 'Commensalisme'];
let clientInformation = {};

const startExperience = (socket) => {
    if (clientConnected.client && clientConnected.client2) {
        console.log("Tous les clients sont connectés");
        socket.emit("startExperience", clientInformation);
    }
};

let client1SocketId;
let client2SocketId;
let client3SocketId;
let client1State;
let client2State;
let client3State;
let gameData = {};
let animalsChosenData = {"one": null, "two": null};
let questionData = {"one": null, "two": null};
io.on("connection", (socket) => {
    stateManager.updateClientState(socket.id, "connected");
    let userId;

    socket.on("registerStudent1", () => {
        socket.join("client1");
        userId = socket.id;
        client1SocketId = socket.id;
        console.log("Client 1 enregistré : ", client1SocketId);
        clientConnected.client = true;
        startExperience(socket);
    });

    socket.on("registerStudent2", () => {
        socket.join("client2");
        client2SocketId = socket.id;
        console.log("Client 2 enregistré : ", client2SocketId);
        clientConnected.client2 = true;
        startExperience(socket);
    });

    socket.on("registerAnimationClient", () => {
        socket.join("client3");
        client3SocketId = socket.id;
        console.log("Animation client registered : ", client3SocketId);
    });

    socket.on("wantsToStartExperience", () => {
        stateManager.updateClientState(socket.id, "wantsToStartExperience");
        client1State = stateManager.getClientState(client1SocketId);
        client2State = stateManager.getClientState(client2SocketId);
        client3State = stateManager.getClientState(client3SocketId);
        if (client1State === "wantsToStartExperience" && client2State === "wantsToStartExperience") {
            io.emit("confirmIntroductionStart");
        }
    });

    socket.on("wantsToContinueIntroduction", () => {
        stateManager.updateClientState(socket.id, "wantsToContinueIntroduction");
        client1State = stateManager.getClientState(client1SocketId);
        client2State = stateManager.getClientState(client2SocketId);
        if (client1State === "wantsToContinueIntroduction" && client2State === "wantsToContinueIntroduction") {
            io.emit("showTeams", stateManager.teams);
            stateManager.updateClientState(client1SocketId, "teams");
            stateManager.updateClientState(client2SocketId, "teams");
        }
    });

    socket.on("addTeam", (teamName) => {
        stateManager.addTeam(teamName);
        client1State = stateManager.getClientState(client1SocketId);
        client2State = stateManager.getClientState(client2SocketId);
        stateManager.updateClientState(client1SocketId, "teamAdded");
        stateManager.updateClientState(client2SocketId, "teamAdded");
        io.emit("teamAdded", teamName);
        socket.broadcast.emit("teamChosen", teamName);
        if (client1State === "teamAdded" && client2State === "teamAdded") {
            teamsAreDoneShowRules();
        }

    });

    // RULES /////////////////////////////////////////
    function teamsAreDoneShowRules() {
        client1State = stateManager.getClientState(client1SocketId);
        client2State = stateManager.getClientState(client2SocketId);
        client3State = stateManager.getClientState(client3SocketId);
        stateManager.updateClientState(client1SocketId, "rules");
        stateManager.updateClientState(client2SocketId, "rules");
        stateManager.updateClientState(client3SocketId, "rules");
        io.emit("teamsAreDoneShowRules");
    }

    socket.on("rulesAreUnderstood", () => {
        client1State = stateManager.getClientState(client1SocketId);
        client2State = stateManager.getClientState(client2SocketId);
        stateManager.updateClientState(client1SocketId, "rulesAreUnderstood");
        stateManager.updateClientState(client2SocketId, "rulesAreUnderstood");
        io.emit("rulesAreDoneSelectThemeRandomly");
    });

    function chooseRandomTheme() {
        // const randomIndex = Math.floor(Math.random() * themes.length);
        // return themes[randomIndex];
        return themes[0];
    }

    socket.on("selectTheme", () => {
        stateManager.updateClientState(client1SocketId, "selectTheme");
        stateManager.updateClientState(client2SocketId, "selectTheme");
        io.emit("themeSelected");
    });

    socket.on("explain", () => {
        client1State = stateManager.getClientState(client1SocketId);
        client2State = stateManager.getClientState(client2SocketId);
        stateManager.updateClientState(client1SocketId, "explain");
        stateManager.updateClientState(client2SocketId, "explain");
        io.emit("themeIsSelectedShowThemeExplanation");
    });
    socket.on("introIndice1", () => {
        client1State = stateManager.getClientState(client1SocketId);
        client2State = stateManager.getClientState(client2SocketId);
        stateManager.updateClientState(client1SocketId, "introIndice1");
        stateManager.updateClientState(client2SocketId, "introIndice1");
        io.emit("setIndice1Screen");
    });



    socket.on("gameOn", () => {
        console.log("Game is launched");
        randomTheme = chooseRandomTheme();
        client1State = stateManager.getClientState(client1SocketId);
        client2State = stateManager.getClientState(client2SocketId);
        stateManager.updateClientState(client1SocketId, "gameOn");
        stateManager.updateClientState(client2SocketId, "gameOn");
        const dataTurnByTurn = [randomTheme, animals[randomTheme]];
        console.log("Data turn by turn: ", dataTurnByTurn);
        gameData = { dataTurn: dataTurnByTurn, nextGameIndex: 0, hiddenCards: { one: [], two: [] } };
        io.emit("startGame", dataTurnByTurn);
    });

    socket.on("updateGameIndex", (nextGameIndex) => {
        gameData.nextGameIndex = nextGameIndex;
    });

    socket.on("updateHiddenCardsone", (hiddenCards) => {
        gameData.hiddenCards.one = hiddenCards;
    });

    socket.on("updateHiddenCardstwo", (hiddenCards) => {
        gameData.hiddenCards.two = hiddenCards;
    });

    socket.on("getCurrentGameData", () => {
        client1State = stateManager.getClientState(client1SocketId);
        client2State = stateManager.getClientState(client2SocketId);
        stateManager.updateClientState(client1SocketId, "getCurrentGameData");
        stateManager.updateClientState(client2SocketId, "getCurrentGameData");
        io.emit("gameDataUpdated", gameData);
    });

    socket.on("getCurrentGameDataLastTime", () => {
        client1State = stateManager.getClientState(client1SocketId);
        client2State = stateManager.getClientState(client2SocketId);
        stateManager.updateClientState(client1SocketId, "getCurrentGameDataLastTime");
        stateManager.updateClientState(client2SocketId, "getCurrentGameDataLastTime");
        io.emit("gameDataUpdatedLastTime", gameData);
    });

    socket.on("introIndice2", () => {
        client1State = stateManager.getClientState(client1SocketId);
        client2State = stateManager.getClientState(client2SocketId);
        stateManager.updateClientState(client1SocketId, "introIndice2");
        stateManager.updateClientState(client2SocketId, "introIndice2");
        if (client1State === "introIndice2" && client2State === "introIndice2") {
            io.emit("setIndice2Screen");
        }
    });

    socket.on("introIndice3", () => {
        client1State = stateManager.getClientState(client1SocketId);
        client2State = stateManager.getClientState(client2SocketId);
        stateManager.updateClientState(client1SocketId, "introIndice3");
        stateManager.updateClientState(client2SocketId, "introIndice3");
        if (client1State === "introIndice3" && client2State === "introIndice3") {
            io.emit("setIndice3Screen");
        }
    });

    socket.on("startAudioClient", () => {
        if (client1State === "introIndice2" && client2State === "introIndice2") {
            io.emit("audioIndice");
        }
    })

    socket.on("stopAudioClient", () => {
        if (client1State === "introIndice3" && client2State === "introIndice3") {
            io.emit("stopAudioIndice");
        }
    });

    // ANIMAL CHOSEN  ////////////////////////////////
    socket.on("animalChosen", (animalChosen) => {
        if (animalChosen[0] === "one") {
            animalsChosenData.one = [animalChosen[1], animalChosen[2]];
        }
        if (animalChosen[0] === "two") {
            animalsChosenData.two = [animalChosen[1], animalChosen[2]];
        }
        client1State = stateManager.getClientState(client1SocketId);
        client2State = stateManager.getClientState(client2SocketId);
        stateManager.updateClientState(client1SocketId, "animalChosen");
        stateManager.updateClientState(client2SocketId, "animalChosen");
        if (client1State === "animalChosen" && client2State === "animalChosen") {
            io.emit("showInteractions", (animalsChosenData));
        }
    });

    socket.on("undestrandInteraction", () => {
        client1State = stateManager.getClientState(client1SocketId);
        client2State = stateManager.getClientState(client2SocketId);
        stateManager.updateClientState(client1SocketId, "undestrandInteraction");
        stateManager.updateClientState(client2SocketId, "undestrandInteraction");
        if (client1State === "undestrandInteraction" && client2State === "undestrandInteraction") {
            io.emit("interactionExplained");
        }
    })

    socket.on("animationIsDoneAskQuestion", () => {
        client1State = stateManager.getClientState(client1SocketId);
        client2State = stateManager.getClientState(client2SocketId);
        stateManager.updateClientState(client1SocketId, "animationIsDoneAskQuestion");
        stateManager.updateClientState(client2SocketId, "animationIsDoneAskQuestion");
            io.emit('askQuestion');
    })

    socket.on("animationQuestionAnswer", (data) => {
        client1State = stateManager.getClientState(client1SocketId);
        client2State = stateManager.getClientState(client2SocketId);
        stateManager.updateClientState(client1SocketId, "animationQuestionAnswer");
        stateManager.updateClientState(client2SocketId, "animationQuestionAnswer");
        socket.broadcast.emit("answerChosen", data)
    })

    // ANIMATION IS ANSWERED  ////////////////////////
    socket.on("animationQuestionIsAnswered", (answerId) => {
        client1State = stateManager.getClientState(client1SocketId);
        client2State = stateManager.getClientState(client2SocketId);
        stateManager.updateClientState(client1SocketId, "animationQuestionIsAnswered");
        stateManager.updateClientState(client2SocketId, "animationQuestionIsAnswered");
    });

    socket.on("answer", (data) => {
        if (data[0] === "one") {
            questionData.one = data[1]
            stateManager.set( "answerChosen" ,data[1]);
            client1State = stateManager.getClientState(client1SocketId);
            stateManager.updateClientState(client1SocketId, "answersAdded");
        }
        if (data[0] === "two") {
            questionData.two = data[1]
            stateManager.set( "answerChosen" ,data[1]);
            client2State = stateManager.getClientState(client2SocketId);
            stateManager.updateClientState(client2SocketId, "answersAdded");
        }
        socket.broadcast.emit("answerChosen", data[1]);
        if (client1State === "answersAdded" && client2State === "answersAdded" && questionData.one !== null && questionData.two !== null) {
            io.emit("questionReveal", questionData);
        }
    });

    socket.on("showConclusion", (answer) => {
        stateManager.set( "showConclusion" ,answer);
        client1State = stateManager.getClientState(client1SocketId);
        client2State = stateManager.getClientState(client2SocketId);
        stateManager.updateClientState(client1SocketId, "showConclusion");
        stateManager.updateClientState(client2SocketId, "showConclusion");
        if (client1State === "showConclusion" && client2State === "showConclusion") {
            io.emit("conclusion");
        }
    });

    interval = setInterval(() => getApiAndEmit(socket), 1000);
    socket.on("disconnect", () => {
        stateManager.updateClientState(socket.id, "disconnected");
        clearInterval(interval);
    })

});

nextApp.prepare().then(() => {
    app.get('*', (req, res) => {
        return nextHandler(req, res)
    });

    server.listen(port, err => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${port}`);
    });
});