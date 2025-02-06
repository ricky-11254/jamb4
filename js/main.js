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
				let html = `
					<!DOCTYPE html>
					<html>
					<head>
						<title>Quiz Results</title>
						<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js"></script>
						<style>
							body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
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
					<div style="text-align: center; margin-top: 20px;">
						<button onclick="downloadResults()" class="download-btn">Download Results</button>
					</div>
					<script>
						function downloadResults() {
							const btn = document.querySelector('.download-btn');
							btn.style.display = 'none';
							const opt = {
								margin: 1,
								filename: 'quiz-results.pdf',
								image: { type: 'jpeg', quality: 0.98 },
								html2canvas: { scale: 2 },
								jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
							};
							html2pdf().set(opt).from(document.body).save().then(function() {
								btn.style.display = 'block';
							}).catch(function(error) {
								btn.style.display = 'block';
							});
						}
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

