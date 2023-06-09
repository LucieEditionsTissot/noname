import React, {useState, useEffect, useRef} from "react";
import {io} from "socket.io-client";
import Head from "next/head";
import ShowTeams from "../components/ShowTeams";
import TurnByTurn from "../components/TurnByTurn";
import Conclusion from "../components/Conclusion";
import StartScreen from "../components/StartScreen";
import Introduce from "../components/Introduce";
import AudioPlayer from "../components/AudioPlayer";
import {url} from "./_app";
import Interaction from "../components/Interaction";
import Question from "../components/Question";
import TurnByTurn2 from "../components/TurnByTurn2";
import TurnByTurn3 from "../components/TurnByTurn3";
import Answer from "../components/Answer";

export default function StudentTablet1() {
    const [otherTeamWantsToContinue, setOtherTeamWantsToContinue] = useState(false);
    const [teamSelected, setTeamSelected] = useState(null);
    const [teamsDone, setTeamsDone] = useState(false);
    const [currentScreen, setCurrentScreen] = useState(null);
    const [turnByTurnData, setTurnByTurnData] = useState({});
    const [interactionsExplainedData, setInteractionsExplainedData] = useState(null);
    const [audioScenario, setAudioScenario] = useState(false);
    const [showAnswer, setShowAnswer] = useState(null);
    const socketClient1Ref = useRef(null);
    const [hiddenCards, setHiddenCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState([]);

    useEffect(() => {
        socketClient1Ref.current = io(url);
        const socketClient1 = socketClient1Ref.current;

        socketClient1.on("connect", function () {
            console.log("Client 1 connected");
            socketClient1.emit("registerStudent1");
        });

        socketClient1.on("disconnect", function () {
            console.log("Client 1 disconnected");
        });

        socketClient1.on("reload", () => {
            window.location.reload();
        });

        socketClient1.on("otherTeamWantsToContinue", () => {
            setOtherTeamWantsToContinue(true);
        });

        socketClient1.on("startExperience", () => {
            setCurrentScreen("start");
        });

        socketClient1.on("confirmIntroductionStart", () => {
            setCurrentScreen("introduce");
        });

        socketClient1.on("showTeams", () => {
            setCurrentScreen("teams");
        });

        socketClient1.on("teamsAreDoneShowRules", () => {
            setTeamsDone(true);
            setCurrentScreen("rules");
        });

        socketClient1.on("rulesAreDoneSelectThemeRandomly", () => {
            setCurrentScreen("theme");
        });

        socketClient1.on("themeIsSelectedShowThemeExplanation", () => {
            setCurrentScreen("themeExplanation");
        });

        socketClient1.on("setIndice1Screen", () => {
            setCurrentScreen("indice1");
        });

        socketClient1.on("setIndice2Screen", () => {
            setCurrentScreen("indice2");
        });

        socketClient1.on("setIndice3Screen", () => {
            setCurrentScreen("indice3");
        });

        socketClient1.on("audioIndice", () => {
            setAudioScenario(true);
        });

        socketClient1.on("stopAudioIndice", () => {
            setAudioScenario(false);
        });

        socketClient1.on("startGame", (data) => {
            setTurnByTurnData(data);
            setCurrentScreen("turnByTurn");
        });

        socketClient1.on("gameDataUpdated", (updatedData) => {
            console.log("game data is: ", updatedData);
            setHiddenCards(updatedData.hiddenCards);
            setCurrentIndex(updatedData.currentIndex);
            setTurnByTurnData((prevData) => {
                console.log(updatedData);
                return {...prevData, ...updatedData};
            });
            setCurrentScreen("turnByTurn2");
        });

        socketClient1.on("gameDataUpdatedLastTime", (updatedData) => {
            console.log("game data is: ", updatedData);
            setHiddenCards(updatedData.hiddenCards);
            setCurrentIndex(updatedData.currentIndex);
            setTurnByTurnData((prevData) => {
                console.log(updatedData);
                return {...prevData, ...updatedData};
            });
            setCurrentScreen("turnByTurn3");
        });

        socketClient1.on("showInteractions", (data) => {
            setShowAnswer(data);
            setCurrentScreen("showInteractions");
        });

        socketClient1.on("interactionExplained", (data) => {
            setInteractionsExplainedData(data);
            setCurrentScreen("understandInteraction");
        });

        socketClient1.on("askQuestion", () => {
            setCurrentScreen("question");
        });

        socketClient1.on("finalExplanation", () => {
            setCurrentScreen("finalExplanation");
        });

        socketClient1.on("conclusion", () => {
            setCurrentScreen("conclusion");
        });

        return () => {
            socketClient1.disconnect();
        };

    }, []);

    useEffect(() => {
        setOtherTeamWantsToContinue(false)
    }, [currentScreen])

    const handleStartButtonClick = () => {
        socketClient1Ref.current.emit("wantsToStartExperience");
        socketClient1Ref.current.emit("otherTeamWantsToContinue");
    }

    const handleContinueIntroduction = () => {
        socketClient1Ref.current.emit("wantsToContinueIntroduction");
        socketClient1Ref.current.emit("otherTeamWantsToContinue");
    };

    const handleAddTeam = (teamName) => {
        socketClient1Ref.current.emit("addTeam", teamName);
        socketClient1Ref.current.emit("otherTeamWantsToContinue");
    }

    const handleAnswerQuestion = (answer) => {
        const data = ["one", Number(answer)]
        socketClient1Ref.current.emit("answer", data);
        socketClient1Ref.current.emit("otherTeamWantsToContinue");
    }

    return (
        <>
            <Head>
                <title>ELIE | Groupe 1</title>
                <meta name="viewport"
                      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/>
                <meta name="application-name" content="MyApp"/>
                <meta name="apple-mobile-web-app-title" content="ELIE"/>
                <meta name="apple-mobile-web-app-capable" content="yes"/>
                <meta name="mobile-web-app-capable" content="yes"/>
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
                <link rel="apple-touch-icon" href="/images/logo-blue.svg"/>
            </Head>

            <div className="global-container">

                <AudioPlayer scenario={audioScenario} src={"audio/loup.mp3"}/>

                <div className={`otherTeamWantsToContinue ${otherTeamWantsToContinue === true ? "show" : ""}`}>
                    <p>L'autre équipe t'attend</p>
                </div>

                {currentScreen === "start" && (
                    <StartScreen onClick={handleStartButtonClick}/>
                )}

                {currentScreen === "introduce" && (
                    <Introduce onClick={handleContinueIntroduction}/>

                )}

                {currentScreen === "teams" && (
                    <ShowTeams socket={socketClient1Ref.current} teamSelected={teamSelected}
                               onTeamSelected={handleAddTeam} client={1}/>
                )}

                {currentScreen === "rules" && teamsDone && (
                    <Interaction title={"Regardez le plateau"} subTitle={"Pour comprendre les règles"} arrow={true}
                                 arrowDown={false} eye={false} volume={false} puzzle={false}
                                 frameText={"Règles du jeu"}/>
                )}

                {currentScreen === "theme" && (
                    <Interaction title={"Choix de l'interaction"} subTitle={""} arrow={true} arrowDown={false}
                                 eye={false}
                                 volume={false} puzzle={false} frameText={"Interaction"}/>
                )}

                {currentScreen === "themeExplanation" && (
                    <Interaction title={"Mutualisme "} subTitle={""} arrow={true} arrowDown={false} eye={false}
                                 volume={false} puzzle={false} frameText={"Mutualisme"}/>
                )}

                {currentScreen === "indice1" && (
                    <Interaction title={"Indice 1"} subTitle={"Regardez le plateau"} arrow={true} arrowDown={false}
                                 eye={true}
                                 volume={false} puzzle={false} frameText={"Indice 1"}/>
                )}

                {currentScreen === "indice2" && (
                    <Interaction title={"Indice 2"} subTitle={"écoutez dans les enceintes"} arrow={true}
                                 arrowDown={true} eye={false}
                                 volume={true} puzzle={false} frameText={"Indice 2"}/>
                )}

                {currentScreen === "indice3" && (
                    <Interaction title={"Indice 3"} subTitle={"Regardez le plateau"} arrow={true} arrowDown={false}
                                 eye={false}
                                 volume={false} puzzle={true} frameText={"Indice 3"}/>
                )}

                {currentScreen === "turnByTurn" && (
                    <TurnByTurn
                        socket={socketClient1Ref.current}
                        data={turnByTurnData}
                        client={"one"}
                        groupName={"teamGroupOne"}
                    />
                )}

                {currentScreen === "turnByTurn2" && (
                    <TurnByTurn2
                        socket={socketClient1Ref.current}
                        data={turnByTurnData}
                        client={"one"}
                        groupName={"teamGroupOne"}
                        hiddenCards={hiddenCards}
                        currentIndex={currentIndex}
                    />
                )}

                {currentScreen === "turnByTurn3" && (
                    <TurnByTurn3
                        socket={socketClient1Ref.current}
                        data={turnByTurnData}
                        client={"one"}
                        groupName={"teamGroupOne"}
                        hiddenCards={hiddenCards}
                        currentIndex={currentIndex}
                    />
                )}

                {currentScreen === "showInteractions" && (
                    <Answer socket={socketClient1Ref.current} animalChosen={showAnswer} client={"one"}/>
                )}

                {currentScreen === "understandInteraction" && (
                    <Interaction title={"Mutualisme"} subTitle={" écoutez et regardez le plateau"} arrow={true}
                                 arrowDown={false} eye={false}
                                 volume={false} puzzle={false} frameText={"Mutualisme"}/>
                )}

                {currentScreen === "question" && (
                    <Question socket={socketClient1Ref.current} onAnswerSelected={handleAnswerQuestion} client={"one"}/>
                )}
                {currentScreen === "finalExplanation" && (
                    <Interaction title={"Explication"} subTitle={" écoutez et regardez le  plateau"} arrow={true} arrowDown={false}
                                 eye={false}
                                 volume={false} puzzle={false} frameText={"Explication"}/>
                )}
                {currentScreen === "conclusion" && <Conclusion/>}


            </div>
        </>
    );
}
