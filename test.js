create({
    //one of text or textSelector are mandatory
    text: "var myvar =1;",
    textSelector : "#ex-1",
    answerTypes: {
        "variables" : "blue",
        "if-statements" : "green"
    }// Mandatory
    //colors : ["magenta"|"blue"|"red"|"green"|"yellow"], //optional
    assessment: "auto"|"manual", //optional. default= auto
    solutionType: "range" | "occurence" | "both"  //mandatory
    solution: [range_1, range_2, ..., range_n] |  [wordOccurence_1, wordOccurence_2, ... wordOccurence_n ]
    lang : "auto"|"Java"|"Javascript"|"HTML", //optional, default="auto"
})


// Modes of assessment
- range-based

Data-structure: [range_1, range_2, ..., range_n]
where range_i = {
                    start: {col:Integer, row:Integer},
                    end: {col:Integer, row:Integer}
                    }



- number of occurences
 [wordOccurence_1, wordOccurence_2, ... wordOccurence_n ]
 where wordOccurence = {word: String,
                        numberOfOccurences : Integer}


