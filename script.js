// script.js

const questions = [
    { question: 'Is the cattle vaccinated within a Year?', options: ['Yes', 'No'] },
    { question: 'Enter the Age of the Cattle (in months)', type: 'slider', min: 1, max: 120 },
    { question: 'What is the duration since the first symptoms appeared?', options: ['1 week', '2 weeks', '3 weeks', '4 weeks'] },
    { question: 'Are there any concurrent diseases in the cattle?', options: ['Yes', 'No'] }
];
// script.js

const initialPage = document.getElementById('initial-page');
const predictionPage = document.getElementById('prediction-page');
const startPredictionsBtn = document.getElementById('start-predictions-btn');

let currentQuestionIndex = 0;
const questionContainer = document.getElementById('question');
const optionsContainer = document.getElementById('options');
const resultContainer = document.getElementById('result-container');
const resultContainer2 = document.getElementById('result-container2');
const outputContainer = document.getElementById('output-container');
const outputContainer1 = document.getElementById('output-container1');
const outputContainer2 = document.getElementById('output-container2');
const resultText = document.getElementById('result');
const outputText1 = document.getElementById('output');
const outputText2 = document.getElementById('output1');
const outputText3 = document.getElementById('output2');
const resultText1 = document.getElementById('result1');
const resultText2 = document.getElementById('result2');


startPredictionsBtn.addEventListener('click', () => {
    initialPage.style.display = 'none'; // Hide the initial page
    predictionPage.style.display = 'block'; // Display the prediction page
    showQuestion(); // Start showing questions
});

function showQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    questionContainer.textContent = currentQuestion.question;

    optionsContainer.innerHTML = '';
    if (currentQuestion.options) {
        currentQuestion.options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.addEventListener('click', () => selectOption(option));
            button.classList.add('button-separator'); // Add separator class
            optionsContainer.appendChild(button);
        });
    } else if (currentQuestion.type === 'slider') {
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = currentQuestion.min;
        slider.max = currentQuestion.max;
        slider.value = currentQuestion.min;
        slider.addEventListener('input', () => updateSliderValue(slider.value));
        optionsContainer.appendChild(slider);

        const valueDisplay = document.createElement('span');
        valueDisplay.textContent = currentQuestion.min;
        optionsContainer.appendChild(valueDisplay);
    }
}


function updateSliderValue(value) {
    const valueDisplay = optionsContainer.querySelector('span');
    valueDisplay.textContent = value;
}


function selectOption(option) {
    // Check if an option is selected
    if (!option && questions[currentQuestionIndex].type !== 'slider') {
        alert("Please select an option.");
        return; // Exit the function if no option is selected and the question is not a slider
    }

    // Update answer based on question type
    if (questions[currentQuestionIndex].type === 'slider') {
        const sliderValue = optionsContainer.querySelector('input[type="range"]').value; // Get the value directly from the slider input
        answers.push(sliderValue);
        console.log('Slider value stored in answers:', sliderValue);
    } else {
        answers.push(option);
    }

    console.log('Answers:', answers); // Log the answers array
    console.log('Current question index:', currentQuestionIndex); // Log the current question index
    console.log('Total number of questions:', questions.length); // Log the total number of questions
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showResult();
    }
}
// Add an event listener to the file input
document.getElementById('file').addEventListener('change', function(event) {
    const file = event.target.files[0];
    showSelectedImage(file);
    infer(file);
});

var infer = function(file) {

    outputText1.textContent = "Detecting Gender...";
    outputContainer.classList.add('fade-in');
    outputContainer.style.display = 'block';

    outputText2.textContent = "Detecting Breed...";
    outputContainer1.classList.add('fade-in');
    outputContainer1.style.display = 'block';

    outputText3.textContent = "Detecting Skin Lesion Coverage...";
    outputContainer2.classList.add('fade-in');
    outputContainer2.style.display = 'block';

    // Read the file as base64
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function() {
        var imageBase64 = reader.result.split(',')[1]; // Extract the base64 data

        axios({
                method: "POST",
                url: "https://outline.roboflow.com/male-or-female-cow/2",
                params: {
                    api_key: "IhgIONcs6JmrRwKk0d2Q",
                },
                data: imageBase64,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    
                }
            })
            .then(function(response) {
             
                console.log('Sex detection API response:', response.data);
               
                var sex = response.data.predictions[0].class;
                outputText1.textContent = "Sex: " + sex;
                outputContainer.style.display = 'block'; // Show the output container
                $('html').scrollTop(100000);
                
                // Add detected sex to answers array
                answers.unshift(sex);
                axios({
                        method: "POST",
                        url: "https://detect.roboflow.com/cattle-breed-wtkzl/2",
                        params: {
                            api_key: "IhgIONcs6JmrRwKk0d2Q",
                            confidence: 5

                        },
                        data: imageBase64,
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        }
                    })
                    .then(function(breedResponse) {
                        
                        
                        // Extract and display the breed information
                        if (breedResponse.data && breedResponse.data.predictions && breedResponse.data.predictions.length > 0) {
                            var breed = breedResponse.data.predictions[0].class;
                            outputText2.textContent = "Breed: " + breed;
                            outputContainer1.style.display = 'block'; // Show the output container
                            $('html').scrollTop(100000);

                            // Add detected breed to answers array
                            answers.push(mapBreed(breed));

                            // Now, send the image data to the Roboflow API to detect lumpy skin lesions
                            axios({
                                    method: "POST",
                                    url: "https://detect.roboflow.com/lsdv-detection/1",
                                    params: {
                                        api_key: "IhgIONcs6JmrRwKk0d2Q",
                                        confidence: 8
                                    },
                                    data: imageBase64,
                                    headers: {
                                        "Content-Type": "application/x-www-form-urlencoded"
                                    }
                                })
                                .then(function(lesionResponse) {
                                    // Handle the response from the lumpy skin lesion detection API
                                    console.log('Lumpy skin lesion detection API response:', lesionResponse.data);
                                    // Count the number of lumpy skin lesions
                                    const numLesions = lesionResponse.data.predictions.length;
                                    if (numLesions < 3) {
                                        outputText3.textContent = "Skin Lesion Cover: Low" ;
                                        outputContainer2.style.display = 'block';
                                        lesion_coverage = 1;
                                    } else if (numLesions < 5) {
                                        lesion_coverage = 2;
                                        outputText3.textContent = "Skin Lesion Cover: Medium" ;
                                        outputContainer2.style.display = 'block';
                                    } else {
                                        lesion_coverage=3;
                                        outputText3.textContent = "Skin Lesion Cover: High" ;
                                        outputContainer2.style.display = 'block';
                                    }
                                    answers.push(lesion_coverage);
                                    console.log('Number of lumpy skin lesions:', numLesions);


                                    // Continue with the rest of your implementation
                                })
                                .catch(function(lesionError) {
                                    // Handle errors from lumpy skin lesion detection API
                                    console.log('Lumpy skin lesion detection API error:', lesionError.message);
                                    // Display error message on the website
                                    outputText3.textContent = "Error: Unable to detect lumpy skin lesions.";
                                    outputContainer2.style.display = 'block'; // Show the output container
                                });
                        } else {
                            console.log('No breed prediction found');
                            outputText2.textContent = "Select an image with clear View.";
                            outputContainer1.style.display = 'block'; // Show the output container
                        }
                    })
                    .catch(function(breedError) {
                        // Handle errors from breed detection API
                        console.log('Breed detection API error:', breedError.message);
                        // Display error message on the website
                        outputText2.textContent = "Error: Unable to detect breed.";
                        outputContainer1.style.display = 'block'; // Show the output container
                    });
            })
            .catch(function(sexError) {
                // Handle errors from sex detection API
                console.log('Sex detection API error:', sexError.message);
                // Display error message on the website
                outputText1.textContent = "Error: Unable to detect sex.";
                outputContainer.style.display = 'block'; // Show the output container
            });
    };
};



function showResult() {
    // Preprocess input data
    const sex_m = answers[0];
    const breed = answers[1];
    const vaccinated = answers[3];
    const age = parseInt(answers[4]);
    const duration = answers[5];
    const severity = answers[2];
    const concurrent = answers[6];
    
    // Convert age to age group
    let age_group;
    if (age < 24) {
        age_group = 1;
    } else if (age < 60) {
        age_group = 2;
    } else {
        age_group = 3;
    }

    // Convert severity to severity_cover
    

    let duration_day;
    switch(duration) {
        case '1 week':
            duration_day = 1;
            break;
        case '2 weeks':
            duration_day = 2;
            break;
        case '3 weeks':
            duration_day = 3;
            break;
        case '4 weeks':
            duration_day = 4;
            break;
    }

    // Convert vaccinated to binary
    const vaccinated_binary = vaccinated === 'Yes' ? 1 : 0;

    // Convert concurrent to binary
    const concurrent_binary = concurrent === 'Yes' ? 1 : 0;

    // Create preprocessed input data object
    const new_data_point_encoded = {
        sex_m: sex_m === 'MaleCow' ? 1 : 0,
        breed_jry: breed === 'Jersey' ? 1 : 0,
        breed_hf: breed === 'Holstein friestein' ? 1 : 0,
        breed_mg: breed === 'Brown Swiss' ? 1 : 0,
        breed_nd: breed === 'Desi' ? 1 : 0,
        vaccinated: vaccinated_binary,
        age: age_group,
        duration: duration_day,
        severity: severity,
        concurrent: concurrent_binary
    };

    // Make prediction
    fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(new_data_point_encoded)
    })
    .then(response => response.json())
    .then(data => {
        const prediction = data.prediction;
        const prob_survival = data.prob_survival; // Probability of survival
        resultText.textContent = `The chances of survival are: ${prob_survival.toFixed(2)}%`;
        if (prob_survival < 40) {
            resultText.style.color = 'red';
        } else if(prob_survival < 70) {
            resultText.style.color = 'yellow';
        }else{
            resultText.style.color = 'green';
        }

        resultContainer.style.display = 'block';
    })
    .catch(error => {
        console.error('Error:', error);
        // Handle error
    });

    nextButton.textContent = "Predict Again";
    // Add event listener to the next button to refresh the page when clicked
    nextButton.addEventListener("click", () => {
        location.reload(); // Refresh the page
    });
}


const answers = [];
const nextButton = document.getElementById('next-btn');
document.addEventListener('click', function(event) {
    if (event.target && event.target.id === 'next-btn') {
        selectOption();
    }
});

const breedMapping = {
    'Jersey': ['Jersey', 'Ayrshire', 'Guernsey'], // Example: Jersey, Ayrshire, and Guernsey are mapped to Jersey
    'Holstein freistein': ['Holstein'], // Example: Holstein is mapped to Holstein freistein
    'Brown Swiss': ['Brown Swiss','Red_Dane'], // Example: Brown Swiss is mapped to itself
    'Desi': ['Alambadi', 'Amritmahal', 'Bargur','Bhadawari','Dangi','Deoni', 'Gir', 'Hallikar', 'Hariana', 'Jaffrabadi', 'Kangayam', 'Kankrej', 'Kasargod', 'Kenkatha', 'Kherigarh', 'Khillari', 'Krishna_Valley', 'Mehsana', 'Murrah', 'Nagori', 'Nagpuri', 'Nili_Ravi', 'Nimari', 'Ongole', 'Pulikulam', 'Rathi', 'Red_Sindhi' ,'Sahiwal', 'Surti', 'Tharparkar', 'Toda', 'Umblachery', 'Vechur'] // Example: Sahiwal and Red Sindhi are mapped to Desi
};

// Function to map detected breed to target breed
function mapBreed(detectedBreed) {
    for (const targetBreed in breedMapping) {
        if (breedMapping[targetBreed].includes(detectedBreed)) {
            return targetBreed; // Return the target breed if detected breed is found in the mapping
        }
    }
    // If no match is found, return null or handle the case accordingly
    return null;
}

// Function to display selected image
function showSelectedImage(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = document.createElement('img');
        img.src = event.target.result;
        img.width = 400; // Adjust image width as needed
        const imageContainer = document.getElementById('image-container');
        imageContainer.innerHTML = ''; // Clear previous image
        imageContainer.appendChild(img); // Append new image
    };
    reader.readAsDataURL(file);
}



