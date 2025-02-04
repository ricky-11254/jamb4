/** Responsive Navbar **/

function myFunction() {
	var x = document.getElementById("myTopnav");
	if (x.className === "topnav") {
		x.className += " responsive";
	} else {
		x.className = "topnav";
	}
}

/** Smooth Scrolling**/
$(document).on("click", 'a[href^="#"]', function (event) {
	event.preventDefault();
	$("html, body").animate(
		{
			scrollTop: $($.attr(this, "href")).offset().top,
		},
		500
	);
});

/** Main Diagnostic Quiz Function **/

(function () {
	var questionCounter = 0; //Tracks question number
	var selections = []; //Array containing user choices
	var quiz = $("#quiz"); //Quiz div object
	var defaultQuestionContent;
	defaultQuestionContent = $("#content").text();

	// Display initial question
	displayNext();

	// Click handler for the 'next' button
	$("#next").on("click", function (e) {
		e.preventDefault();

		// Suspend click listener during fade animation
		if (quiz.is(":animated")) {
			return false;
		}
		choose();

		// If no user selection, progress stopped and pop-up alert
		if (isNaN(selections[questionCounter])) {
			swal("Please make a selection.", "Choose the best option.", "warning");
		} else {
			questionCounter++;
			displayNext();
		}
	});

	// Click handler for the 'prev' button
	$("#prev").on("click", function (e) {
		e.preventDefault();

		if (quiz.is(":animated")) {
			return false;
		}
		choose();
		questionCounter--;
		displayNext();
	});

	// Click handler for the 'Start Over' button
	$("#start").on("click", function (e) {
		e.preventDefault();

		if (quiz.is(":animated")) {
			return false;
		}
		questionCounter = 0;
		selections = [];
		displayNext();
		$("#start").hide();
	});

	// Animates buttons on hover
	$(".button").on("mouseenter", function () {
		$(this).addClass("active");
	});
	$(".button").on("mouseleave", function () {
		$(this).removeClass("active");
	});

	// Creates and returns the div that contains the questions and
	// the answer selections
	function createQuestionElement(index) {
		var qElement = $("<div>", {
			id: "question",
		});

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

	// Creates a list of the answer choices as radio inputs
	function createRadios(index) {
		var radioList = $("<ul>");
		var item;
		var input = "";
		for (var i = 0; i < questions[index].choices.length; i++) {
			item = $("<li>");
			input = '<label><input type="radio" name="answer" value=' + i + " />";
			input += questions[index].choices[i];
			input += "</label>";
			item.append(input);
			radioList.append(item);
		}
		return radioList;
	}

	// Reads the user selection and pushes the value to an array
	function choose() {
		selections[questionCounter] = +$('input[name="answer"]:checked').val();
	}

	// Displays next requested element
	function displayNext() {
		quiz.fadeOut(function () {
			$("#question").remove();

			if (questionCounter < questions.length) {
				var question = questions[questionCounter];

				// Show 'image' defined in question object

				if (typeof question.image !== "undefined") {
					$("#image img").attr("src", "https://ricky-11254.github.io/jamb4/" + question.image);
					$("#image").show();
				} else {
					$("#image").hide();
				}

				if (typeof question.audio !== "undefined") {
					$("#audio").show();
					$("#audio audio").attr("src", "https://ricky-11254.github.io/jamb4/audio/" + question.audio);
					//$("#audio audio")[0].play();
				} else {
					$("#audio").hide();
					$("#audio audio").stop();
				}

				// Show 'content' defined in question object
				console.log(typeof question.content, defaultQuestionContent);
				if (typeof question.content === "undefined") {
					$("#content").text(defaultQuestionContent);
				} else {
					$("#content").text(question.content);
				}

				// Show 'qType' defined in question object
				console.log(typeof question.qType, defaultQuestionContent);
				if (typeof question.qType === "undefined") {
					$("#qType").text(defaultQuestionContent);
				} else {
					$("#qType").text(question.qType);
				}

				var nextQuestion = createQuestionElement(questionCounter);
				quiz.append(nextQuestion).fadeIn();
				if (!isNaN(selections[questionCounter])) {
					$("input[value=" + selections[questionCounter] + "]").prop(
						"checked",
						true
					);
				}

				// Controls display of 'prev' button
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
				$("#start").show();
			}
		});
	}
	 function getScore() {
      let numCorrect = 0;
      for (let i = 0; i < selections.length; i++) {
        if (questions[i].isExternal) {
          // For external question, we consider it correct if the result is "Correct!"
          if ($("#result").text() === "Correct!") {
            numCorrect++;
          }
        } else if (selections[i] === questions[i].correctAnswer) {
          numCorrect++;
        }
      }
      return numCorrect;
    }

    // Computes score and returns a paragraph element to be displayed
    function displayScore() {
      // Move results generation INSIDE this function
        function generateResultsPage() {
            // Calculate score
            const score = getScore();
            const totalQuestions = questions.length;

            // Start building HTML content
            let html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Quiz Results</title>
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.3.1/jspdf.umd.min.js"></script>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            max-width: 800px; 
                            margin: 0 auto; 
                            padding: 20px; 
                        }
                        .question { 
                            margin-bottom: 30px; 
                            border: 1px solid #ddd; 
                            padding: 15px; 
                            border-radius: 5px; 
                        }
                        .choice {
                            padding: 10px;
                            margin: 5px 0;
                            border-radius: 5px;
                        }
                        .correct {
                            background-color: #d4edda;
                            border: 2px solid #28a745;
                        }
                        .incorrect {
                            background-color: #f8d7da;
                            border: 2px solid #dc3545;
                        }
                        .explanation {
                            background-color: #f8f9fa;
                            border: 1px solid #e2e6ea;
                            padding: 10px;
                            margin-top: 10px;
                        }
                        .score {
                            text-align: center;
                            font-size: 24px;
                            margin-bottom: 20px;
                        }
                        .question-image {
                            max-width: 100%;
                            height: auto;
                            display: block;
                            margin: 10px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="score">
                        You scored ${score} out of ${totalQuestions}
                    </div>
            `;

            // Generate results for each question
            questions.forEach((question, index) => {
                const userAnswer = selections[index];
                const isCorrect = userAnswer === question.correctAnswer;

                // Start question div
                html += `
                    <div class="question">
                        <h3>Question ${index + 1}: ${question.qType || 'Question'}</h3>
                        <p>${question.question}</p>
                `;

                // Add image if exists
                if (question.image) {
                    html += `<img src="https://ricky-11254.github.io/jamb4/${question.image}" alt="Question Image" class="question-image">`;
                }

                // Add audio if exists
                if (question.audio) {
                    html += `
                        <audio controls>
                            <source src="https://ricky-11254.github.io/jamb4/audio/${question.audio}" type="audio/mpeg">
                            Your browser does not support the audio element.
                        </audio>
                    `;
                }

                // Generate choices
                html += `<div class="choices">`;
                question.choices.forEach((choice, choiceIndex) => {
                    let choiceClass = '';
                    if (choiceIndex === question.correctAnswer) {
                        choiceClass = 'correct'; // Always highlight correct answer in green
                    }
                    if (choiceIndex === userAnswer) {
                        choiceClass += isCorrect ? ' correct' : ' incorrect';
                    }

                    html += `
                        <div class="choice ${choiceClass}">
                            ${choice}
                        </div>
                    `;
                });
                html += `</div>`;

                // Add explanation if the answer was incorrect
                if (!isCorrect && question.explanation) {
                    html += `
                        <div class="explanation">
                            <strong>Explanation:</strong> ${question.explanation}
                        </div>
                    `;
                }

                html += `</div>`; // Close question div
            });

            // Close HTML
            html += `
                <div style="text-align: center; margin-top: 20px;">
                    <button onclick="downloadResults()" class="download-btn">Download Results</button>
                </div>
                <script>
                    function downloadResults() {
                        // Remove the download button temporarily
                        const btn = document.querySelector('.download-btn');
                        btn.style.display = 'none';
                        
                        // PDF options
                        const opt = {
                            margin: 1,
                            filename: 'quiz-results.pdf',
                            image: { type: 'jpeg', quality: 0.98 },
                            html2canvas: { scale: 2 },
                            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                        };

                        // Generate PDF from the body content
                        html2pdf().set(opt).from(document.body).save().then(function() {
                            // Show the button again after PDF is generated
                            btn.style.display = 'block';
                        });
                    }
                </script>
                </body>
                </html>
            `;

            // Open results in a new window
            const resultsWindow = window.open('', '_blank');
            resultsWindow.document.write(html);
            resultsWindow.document.close();
        }

       // Call results generation
       generateResultsPage();
    
       // Create and return score element
       const scoreElem = $("<p>", { id: "question" });
       scoreElem.append(
           "You got " +
           getScore() +
           " questions out of " +
           questions.length +
           " right."
       );
       return scoreElem;
    }
    /*
    window.onload = function () {
      emailCapture();
    };

    // Email capture
    function emailCapture() {
      const qy = questionCounter + 1;
      const capt = document.getElementById("capt");

      if (qy % 5 === 0) {
        capt.style.display = "block";
      } else {
        capt.style.display = "none";
      }
    }
      */
  })();
