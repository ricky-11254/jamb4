document.addEventListener("DOMContentLoaded", (event) => {
	const modal = document.getElementById("quizModal");
	const agreeButton = document.getElementById("agreeButton");

	agreeButton.addEventListener("click", () => {
		modal.style.display = "none";
	});

	function myFunction() {
		var x = document.getElementById("myTopnav");
		if (x.className === "topnav") {
			x.className += " responsive";
		} else {
			x.className = "topnav";
		}
	}

	$(document).on("click", 'a[href^="#"]', function (event) {
		event.preventDefault();
		$("html, body").animate(
			{
				scrollTop: $($.attr(this, "href")).offset().top,
			},
			500
		);
	});

	(function () {
		var questionCounter = 0;
		var selections = [];
		var quiz = $("#quiz");
		var defaultQuestionContent = $("#content").text();

		displayNext();

		$("#next").on("click", function (e) {
			e.preventDefault();
			if (quiz.is(":animated")) return false;
			choose();
			if (isNaN(selections[questionCounter])) {
				swal("Please make a selection.", "Choose the best option.", "warning");
			} else {
				questionCounter++;
				displayNext();
			}
		});

		$("#prev").on("click", function (e) {
			e.preventDefault();
			if (quiz.is(":animated")) return false;
			choose();
			questionCounter--;
			displayNext();
		});

		$(".button").on("mouseenter", function () {
			$(this).addClass("active");
		});
		$(".button").on("mouseleave", function () {
			$(this).removeClass("active");
		});

		function createQuestionElement(index) {
			var qElement = $("<div>", { id: "question" });
			var header = $("<h2>Question " + (index + 1) + ":</h2>");
			qElement.append(header);
			var textProblem = $("<p>").append(questions[index].textProblem);
			qElement.append(textProblem);
			var question = $("<p>").append(questions[index].question);
			qElement.append(question);
			var radioButtons = createRadios(index);
			qElement.append(radioButtons);
			return qElement;
		}

		function createRadios(index) {
			var radioList = $("<ul>");
			for (var i = 0; i < questions[index].choices.length; i++) {
				var item = $("<li>");
				var input = '<label><input type="radio" name="answer" value=' + i + " />";
				input += questions[index].choices[i];
				input += "</label>";
				item.append(input);
				radioList.append(item);
			}
			return radioList;
		}

		function choose() {
			selections[questionCounter] = +$('input[name="answer"]:checked').val();
		}

		function displayNext() {
			quiz.fadeOut(function () {
				$("#question").remove();
				if (questionCounter < questions.length) {
					var question = questions[questionCounter];
					if (typeof question.image !== "undefined") {
						$("#image img").attr("src", "https://ricky-11254.github.io/jamb4/" + question.image);
						$("#image").show();
					} else {
						$("#image").hide();
					}
					if (typeof question.audio !== "undefined") {
						$("#audio").show();
						$("#audio audio").attr("src", "https://ricky-11254.github.io/jamb4/audio/" + question.audio);
					} else {
						$("#audio").hide();
						$("#audio audio").stop();
					}
					if (typeof question.content === "undefined") {
						$("#content").text(defaultQuestionContent);
					} else {
						$("#content").text(question.content);
					}
					if (typeof question.qType === "undefined") {
						$("#qType").text(defaultQuestionContent);
					} else {
						$("#qType").text(question.qType);
					}
					var nextQuestion = createQuestionElement(questionCounter);
					quiz.append(nextQuestion).fadeIn();
					if (!isNaN(selections[questionCounter])) {
						$("input[value=" + selections[questionCounter] + "]").prop("checked", true);
					}
					if (questionCounter === 1) {
						$("#prev").show();
					} else if (questionCounter === 0) {
						$("#prev").hide();
						$("#next").show();
					}
				} else {
					var scoreElem = displayScore();
					quiz.append(scoreElem).fadeIn();
					$("#next").hide();
					$("#prev").hide();
				}
			});
		}

		function getScore() {
			let numCorrect = 0;
			for (let i = 0; i < selections.length; i++) {
				if (questions[i].isExternal) {
					if ($("#result").text() === "Correct!") {
						numCorrect++;
					}
				} else if (selections[i] === questions[i].correctAnswer) {
					numCorrect++;
				}
			}
			return numCorrect;
		}

		function displayScore() {
			function generateResultsPage() {
                const score = getScore();
                const totalQuestions = questions.length;
                const formattedDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
                const opt = {
                    margin: 10,
                    filename: 'QuizResults_' + formattedDate + '.pdf',
                    image: { type: 'jpeg', quality: 1.0 },
                    html2canvas: { scale: 4 },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };
                let html = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
                        <style>
                            .container {
                                position: fixed;
                                top: 20%;
                                left: 28%;
                                margin-top: -65px;
                                margin-left: -100px;
                                border-radius: 7px;
                            }
                            .card {
                                box-sizing: content-box;
                                width: 700px;
                                padding: 30px;
                                border: 1px solid black;
                                font-style: sans-serif;
                                background-color: #f0f0f0;
                            }
                            #button {
                                background-color: #4caf50;
                                border-radius: 5px;
                                margin-left: 650px;
                                margin-bottom: 5px;
                                color: white;
                            }
                            h2 {
                                text-align: center;
                                color: #24650b;
                            }
                            .question { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
                            .choice { padding: 10px; margin: 5px 0; border-radius: 5px; }
                            .correct { background-color: #d4edda; border: 2px solid #28a745; }
                            .incorrect { background-color: #f8d7da; border: 2px solid #dc3545; }
                            .explanation { background-color: #f8f9fa; border: 1px solid #e2e6ea; padding: 10px; margin-top: 10px; }
                            .score { text-align: center; font-size: 24px; margin-bottom: 20px; }
                            .question-image { max-width: 100%; height: auto; display: block; margin: 10px 0; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <button id="button">Generate PDF</button>
                            <div class="card" id="makepdf">
                                <h2>Quiz Results</h2>
                                <div class="score">You scored ${score} out of ${totalQuestions}</div>
                `;
                questions.forEach((question, index) => {
                    const userAnswer = selections[index];
                    const isCorrect = userAnswer === question.correctAnswer;
                    html += `
                        <div class="question">
                            <h3>Question ${index + 1}: ${question.qType || 'Question'}</h3>
                            <p>${question.question}</p>
                    `;
                    if (question.image) {
                        html += `<img src="https://ricky-11254.github.io/jamb4/${question.image}" alt="Question Image" class="question-image">`;
                    }
                    if (question.audio) {
                        html += `
                            <audio controls>
                                <source src="https://ricky-11254.github.io/jamb4/audio/${question.audio}" type="audio/mpeg">
                                Your browser does not support the audio element.
                            </audio>
                        `;
                    }
                    html += `<div class="choices">`;
                    question.choices.forEach((choice, choiceIndex) => {
                        let choiceClass = '';
                        if (choiceIndex === question.correctAnswer) {
                            choiceClass = 'correct';
                        }
                        if (choiceIndex === userAnswer) {
                            choiceClass += isCorrect ? ' correct' : ' incorrect';
                        }
                        html += `<div class="choice ${choiceClass}">${choice}</div>`;
                    });
                    html += `</div>`;
                    if (!isCorrect && question.explanation) {
                        html += `<div class="explanation"><strong>Explanation:</strong> ${question.explanation}</div>`;
                    }
                    html += `</div>`;
                });
                html += `
                            </div>
                        </div>
                        <script>
                            let button = document.getElementById("button");
                            let makepdf = document.getElementById("makepdf");

                            button.addEventListener("click", function () {
                                html2pdf().set(${JSON.stringify(opt)}).from(makepdf).save();
                            });
                        </script>
                    </body>
                    </html>
                `;
                const resultsWindow = window.open('', '_blank');
                resultsWindow.document.write(html);
                resultsWindow.document.close();
            }
			generateResultsPage();
			const scoreElem = $("<p>", { id: "question" });
			scoreElem.append("You got " + getScore() + " questions out of " + questions.length + " right.");
			return scoreElem;
		}
	})();
});

