(function($){
    "use strict";

    var Console = require("./utilities/Console.js");
    var fbConsole = Console({context: "Feedback"});



    window.onload = function() {
        var feedbackButton = document.querySelector(".feedback a");
        var feedbackSection = document.getElementById("ae-feedback");

        feedbackButton.addEventListener('click',function(){
            feedbackSection.classList.toggle("feedback-open");
        });
    }


})(jQuery);
