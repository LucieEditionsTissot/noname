import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import ShowTeams from "../components/ShowTeams";
import ThemeScreen from "../components/ThemeScreen";
import RulesScreen from "../components/RulesScreen";
import TurnByTurn from "../components/TurnByTurn";
import AnimationQuestionScreen from "../components/AnimationQuestionScreen";
import ThemeExplanation from "../components/ThemeExplanation";
import ShowInteractions from "../components/ShowInteractions";
import UnderstandInteraction from "../components/UnderstandInteraction";
import Conclusion from "../components/Conclusion";
import AudioPlayer from "../components/AudioPlayer";
import { url } from "./_app";
import StartScreen from "../components/StartScreen";
import Introduce from "../components/Introduce";
import { io } from "socket.io-client";
import Interaction from "../components/Interaction";

export default function StudentTablet2() {
    const [otherTeamWantsToContinue, setOtherTeamWantsToContinue] = useState(
        false
    );
    const [teamSelected, setTeamSelected] = useState(null);
    const [rulesButtonClicked, setRulesButtonClicked] = useState(false);
    const [teamsDone, setTeamsDone] = useState(false);
    const [currentScreen, setCurrentScreen] = useState(null);
    const [turnByTurnData, setTurnByTurnData] = useState(null);
    const [animationInProgress, setAnimationInProgress] = useState(false);
    const [animationQuestionData, setAnimationQuestionData] = useState([]);
    const [themeSelected, setThemeSelected] = useState(null);
    const [themeExplanationFinished, setExplanationFinished] = useState(false);
    const [animalCards, setAnimalCards] = useState([]);
    const [showAnswer, setShowAnswer] = useState(false);
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [interactionsData, setInteractionsData] = useState(null);
    const [interactionsExplainedData, setInteractionsExplainedData] = useState(
        null
    );
    const [audioScenario, setAudioScenario] = useState(null);
    const [currentScenario, setCurrentScenario] = useState(null);
    const [audioLoaded, setAudioLoaded] = useState(false);
    const [currentAudio, setCurrentAudio] = useState(null);
    const socketClient2Ref = useRef(null);

    useEffect(() => {
        socketClient2Ref.current = io(url);
        const socketClient2 = socketClient2Ref.current;

        socketClient2.on("connect", function () {
            console.log("Client 2 connected");
            socketClient2.emit("registerStudent2");
        });

        socketClient2.on("disconnect", function () {
            console.log("Client 2 disconnected");
        });

        setOtherTeamWantsToContinue(false);

        if (rulesButtonClicked) {
            socketClient2.emit("rulesAreUnderstood");
        }

        socketClient2.on("otherTeamWantsToContinue", () => {
            setOtherTeamWantsToContinue(true);
        });

        socketClient2.on("startExperience", () => {
            setCurrentScreen("start");
        });

        socketClient2.on("confirmIntroductionStart", () => {
            console.log("hello");
            setCurrentScreen("introduce");
        });

        socketClient2.on("showTeams", () => {
            setCurrentScreen("teams");
        });

        socketClient2.on("teamsAreDoneShowRules", () => {
            setTeamsDone(true);
            setCurrentScreen("rules");
        });

        socketClient2.on("rulesAreDoneSelectThemeRandomly", () => {
            socketClient2.emit("chooseTheme");
            setCurrentScreen("theme");
        });

        socketClient2.on("themeSelected", (data) => {
            setThemeSelected(data);
            socketClient2.emit("themeIsRandomlyChosen", data);
        });

        socketClient2.on("themeIsSelectedShowThemeExplanation", (data) => {
            setCurrentScreen("themeExplanation");
        });

        socketClient2.on("startTurnByTurn", (data) => {
            setTurnByTurnData(data);
            setCurrentScreen("turnByTurn");
        });

        socketClient2.on("showInteractions", (data) => {
            setInteractionsData(data);
            setCurrentScreen("showInteractions");
        });

        socketClient2.on("interactionExplained", (data) => {
            setInteractionsExplainedData(data);
            setCurrentScreen("understandInteraction");
        });

        socketClient2.on("askQuestion", (data) => {
            setAnimationQuestionData(data);
            setCurrentScreen("animationQuestion");
        });

        socketClient2.on("conclusion", () => {
            setCurrentScreen("conclusion");
        });

        socketClient2.on("scenarsocketClient2", (scenario) => {
            setCurrentScenario(scenario);
            setAudioLoaded(false);

            const audioElement = new Audio(scenario.audios[0]);
            audioElement.addEventListener("canplaythrough", () => {
                setAudioLoaded(true);
            });

            setCurrentAudio(audioElement);
        });
        return () => {
            socketClient2.disconnect();
        };
    }, );
  const handleAddTeam = (teamName) => {
      socketClient2Ref.current.emit("addTeam", teamName);
    }
    const handleContinueIntroduction = () => {
        socketClient2Ref.current.emit("wantsToContinueIntroduction");
    };

    const handleStartButtonClick = () => {
        socketClient2Ref.current.emit("wantsToStartExperience");
    };
    const handleRulesButtonClick = () => {
        socketClient2Ref.current.emit("rules");
    };


    return (
        <>
            <Head> <title>ELIE | Groupe 1</title> <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" /> <meta name="application-name" content="MyApp" /> <meta name="apple-mobile-web-app-title" content="ELIE" /> <meta name="apple-mobile-web-app-capable" content="yes" /> <meta name="mobile-web-app-capable" content="yes" /> <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" /> <link rel="apple-touch-icon" href="/images/logo-blue.svg" /> </Head>

            <div className="global-container">
                {otherTeamWantsToContinue && (
                    <div className="otherTeamWantsToContinue"></div>
                )}

                {currentScreen === "start" && (
                    <StartScreen onClick={handleStartButtonClick} />
                )}

                {currentScreen === "introduce" && (
                    <Introduce onClick={handleContinueIntroduction} />
                )}

                {currentScreen === "teams" && (
                    <ShowTeams socket={socketClient2Ref.current}
                        teamSelected={teamSelected}  onTeamSelected={handleAddTeam}
                    />
                )}

                {currentScreen === "rules" && teamsDone && (
                    // <RulesScreen socket={socketClient1Ref.current} onRulesButtonClicked={handleRulesButtonClick} />
                    <Interaction title={"Regardez le plateau"} subTitle={"Pour comprendre les règles"} arrow={true} arrowDown={false} eye={false} volume={false} puzzle={false} frameText={"Règles du jeu"}/>
                )}

                {currentScreen === "theme" && (
                    //<ThemeScreen themeSelected={themeSelected}/>
                    <Interaction title={"Choix du thème"} subTitle={""} arrow={true} arrowDown={false} eye={false} volume={false} puzzle={false} frameText={"Choix du thème"}/>
                )}

                {currentScreen === "themeExplanation" && (
                    //<ThemeExplanationScreen themeSelected={themeSelected}/>
                    <Interaction title={"Mutualisme"} subTitle={""} arrow={false} arrowDown={false} eye={false} volume={false} puzzle={false} frameText={"Mutualisme"}/>
                )}

                {currentScreen === "turnByTurn" && (
                    <TurnByTurn
                        data={turnByTurnData}
                        client={2}
                        groupName={"teamGroupTwo"}
                    />
                )}

                {currentScreen === "showInteractions" && (
                    <ShowInteractions data={interactionsData} />
                )}

                {currentScreen === "understandInteraction" && (
                    <UnderstandInteraction themeSelected={themeSelected} />
                )}

                {currentScreen === "animationQuestion" && (
                    <AnimationQuestionScreen data={animationQuestionData} />
                )}

                {currentScreen === "conclusion" && <Conclusion />}

                {currentScenario && currentScenario.id === 12 && (
                    <AudioPlayer src={currentScenario.audios} />
                )}
            </div>
        </>
    );
}
