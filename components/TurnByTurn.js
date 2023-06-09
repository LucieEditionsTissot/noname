import {useEffect, useState} from "react";
import Frame from "./Frame";

function TurnByTurn({socket, data, client, groupName}) {
    const [stateOfTheGame, setStateOfTheGame] = useState([]);
    const [maxNumberOfCard, setMaxNumberOfCard] = useState(3);
    const [dataAnimals, setData] = useState([]);
    const [randomTheme, setRandomTheme] = useState("");
    const [animals, setAnimals] = useState({});
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [currentGameIndex, setCurrentGameIndex] = useState(0);
    const [validateIsClicked, setValidateIsClicked] = useState(false);

    useEffect(() => {
        setData(data);
        setStateOfTheGame(stateOfTheGame.slice(1));
        setRandomTheme(data[0]);
        const animalData = data[1];
        if (animalData) {
            setAnimals(animalData[groupName]["animals"]);
            setCorrectAnswer(animalData[groupName]["answer"]);
        }
    }, [data]);

    function handleFlipCard(e) {
        const element = e.target.closest(".animal");
        const allCards = document.querySelectorAll(".animal");
        let allHiddenCards = document.querySelectorAll(".animal.hidden");

        if (!validateIsClicked) {

            if (allHiddenCards.length < maxNumberOfCard) {
                element.classList.toggle("hidden");
            } else {
                if (element.classList.contains("hidden")) {
                    element.classList.remove("hidden");
                }
            }

            const numberOfHiddenCard = document.querySelectorAll(".animal.hidden").length;
            const buttonNext = document.querySelector(".button-next");
            if (numberOfHiddenCard === 3) {
                buttonNext.classList.remove("disabled")
            } else {
                buttonNext.classList.add("disabled")
            }

        }

    }

    function handleClickOnNextButton() {
        const buttonNext = document.querySelector(".button-next");

        if (!buttonNext.classList.contains("disabled")) {
            const nextGameIndex = currentGameIndex + 1;
            setCurrentGameIndex(nextGameIndex);

            const hiddenCards = Array.from(
                document.querySelectorAll(".animal.hidden")
            ).map((card) => card.id);

            socket.emit("introIndice2");
            socket.emit("startAudioClient");
            socket.emit("updateHiddenCards" + client, hiddenCards);
            socket.emit("updateGameIndex", nextGameIndex);

            setStateOfTheGame([...stateOfTheGame]);

            buttonNext.classList.add("disabled");
            setValidateIsClicked(true)
        }
    }

    return (
        <section id="turnByTurn">
            <Frame color={"green"} crop={false} text={randomTheme}/>
            <div className="template-wrapper">
                <div className="top-part">
                    <div className="left-part">
                        <h3>Masquez 3 espèces</h3>
                        <h6>Qui ne correspondent pas à l'indice</h6>
                    </div>
                    <div
                        className="button-next flex flex-row justify-center items-center rounded-full disabled"
                        onClick={handleClickOnNextButton}
                    >
                        <p>Suivant</p>
                        <img src={"images/next-icon-wheat.svg"} alt="Next icon"/>
                    </div>
                </div>
                <div className="bottom-part animal-wrapper">
                    {animals !== undefined &&
                        animals.length > 0 &&
                        animals.map((animal, index) => (
                            <div key={index} id={index} className="animal" onClick={(e) => handleFlipCard(e)}>
                                <img src={"images/animals/" + animal.icon} alt="Animal icon"/>
                                <p>{animal.name}</p>
                            </div>
                        ))}
                </div>
            </div>
        </section>
    );
}

export default TurnByTurn;

