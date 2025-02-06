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
    // DONE - Need to comment this out to remove the start over button
    //	$("#start").on("click", function (e) {
    //		e.preventDefault();
    //
    //		if (quiz.is(":animated")) {
    //			return false;
    //		}
    //		questionCounter = 0;
    //		selections = [];
    //		displayNext();
    //		$("#start").hide();
    //	});

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
				//$("#start").show();
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
      function generateResultsPage() {
        const score = getScore();
        const totalQuestions = questions.length;

        // Create results container
        const container = document.createElement('div');
        container.className = 'results-container';
        
        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
          .results-container {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .score-header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: #f8f9fa;
          }
          .question-section {
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid #ddd;
          }
          .choice {
            padding: 10px;
            margin: 5px 0;
          }
          .correct {
            background-color: #d4edda;
            border: 1px solid #28a745;
          }
          .user-correct {
            background-color: #d4edda;
            border: 2px solid #28a745;
          }
          .user-incorrect {
            background-color: #f8d7da;
            border: 2px solid #dc3545;
          }
          .explanation {
            margin-top: 15px;
            padding: 15px;
            background-color: #f8f9fa;
          }
          img {
            max-width: 100%;
            height: auto;
          }
        `;
        document.head.appendChild(styles);

        // Create content HTML
        const content = `
          <div class="score-header">
            <h1>Quiz Results</h1>
            <p style="font-size: 24px;">Score: ${score} out of ${totalQuestions}</p>
          </div>
          
          <div class="questions-review">
            ${questions.map((question, index) => {
              const userAnswer = selections[index];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return `
                <div class="question-section">
                  <h3>Question ${index + 1}</h3>
                  ${question.qType ? `<p style="color: #666;">${question.qType}</p>` : ''}
                  <p style="font-weight: 500;">${question.question}</p>
                  
                  ${question.image ? `
                    <div style="margin: 10px 0;">
                      <img src="https://ricky-11254.github.io/jamb4/${question.image}" 
                           alt="Question ${index + 1} Image">
                    </div>
                  ` : ''}
                  
                  ${question.audio ? `
                    <div style="margin: 10px 0;">
                      <audio controls>
                        <source src="https://ricky-11254.github.io/jamb4/audio/${question.audio}" 
                                type="audio/mpeg">
                      </audio>
                    </div>
                  ` : ''}
                  
                  <div class="choices-section">
                    ${question.choices.map((choice, choiceIndex) => `
                      <div class="choice ${choiceIndex === question.correctAnswer ? 'correct' : ''} 
                                      ${choiceIndex === userAnswer ? (isCorrect ? 'user-correct' : 'user-incorrect') : ''}">
                        ${choice}
                      </div>
                    `).join('')}
                  </div>
                  
                  ${!isCorrect && question.explanation ? `
                    <div class="explanation">
                      <strong>Explanation:</strong> ${question.explanation}
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        `;

        // Create temporary container and add content
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = content;
        document.body.appendChild(tempContainer);

        // Initialize jsPDF with slightly larger page size for better content fit
        const pdf = new jsPDF('p', 'pt', 'a4');
        
        // PDF generation settings
        const options = {
          margin: [40, 40, 40, 40],
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false
          },
          jsPDF: {
            unit: 'pt',
            format: 'a4',
            orientation: 'portrait'
          }
        };

        // Generate PDF
        html2pdf().from(tempContainer).set(options).save('quiz-results.pdf').then(() => {
          // Clean up temporary elements
          document.body.removeChild(tempContainer);
          document.head.removeChild(styles);
        });
      }

      // Create download button
      const downloadButton = $("<button>", {
        text: "Download Results",
        class: "download-button",
        css: {
          display: "block",
          margin: "20px auto",
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        },
        click: function(e) {
          e.preventDefault();
          generateResultsPage();
        }
      });

      // Create score element
      const scoreElem = $("<div>", { id: "question" }).append(
        $("<p>", {
          text: `You got ${getScore()} questions out of ${questions.length} right.`,
          css: {
            fontSize: "20px",
            textAlign: "center",
            marginBottom: "20px"
          }
        }),
        downloadButton
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
