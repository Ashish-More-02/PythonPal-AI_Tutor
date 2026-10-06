// Guided projects: each is ONE real program that grows step by step, in
// /projects/<id>.py. They use what the Python Basics lessons teach.
//
// `goal` is for the AI checker only and never leaves the server; `task` is what
// the learner sees. Project and step ids are stored in LearnProgress, so don't
// rename them once real users have progress.

const projects = [
  {
    id: "tip-calculator",
    title: "Tip Calculator",
    description:
      "Build a program that asks for a bill and works out the tip and total. Best after Lesson 6.",
    starterCode: "# My Tip Calculator\n# Write your code below this line\n\n",
    steps: [
      {
        id: "print",
        title: "Say hello",
        explanation: `Every program talks to you through **print()**. Whatever you put inside the brackets shows up in the Output.

Text goes inside quotes. Python calls text in quotes a **string**.

\`\`\`python
print("Hello there!")
\`\`\`

Press Run and you'll see \`Hello there!\` in the Output.`,
        task: 'Use print() to show a welcome message, like "Welcome to the Tip Calculator!"',
        goal: "The program uses print() to display a welcome message. Any friendly wording is fine.",
      },
      {
        id: "variables",
        title: "Remember the bill",
        explanation: `A **variable** is a name that holds a value, like a labelled box.

\`\`\`python
age = 12
print(age)
\`\`\`

\`age = 12\` puts 12 in a box called \`age\`. \`print(age)\` shows what's inside (no quotes — quotes would print the word "age" instead).

You can print a label and a value together with a comma:

\`\`\`python
print("Age:", age)
\`\`\``,
        task: "Under your welcome message, make a variable called bill set to 50, then print it with a label.",
        goal: "The program assigns a number to a variable named bill and prints the bill's value. The earlier welcome print may still be there.",
      },
      {
        id: "maths",
        title: "Work out the tip",
        explanation: `Python can do maths: \`+\` add, \`-\` subtract, \`*\` multiply, \`/\` divide.

You can use variables in maths, and save the answer in a new variable:

\`\`\`python
price = 20
double = price * 2
print("Double:", double)
\`\`\`

A 15% tip is the bill times \`0.15\`.`,
        task: "Make a variable tip that is 15% of bill, and a variable total that is bill + tip. Print both with labels.",
        goal: "The program computes tip as 15% of bill using the bill variable (bill * 0.15 or equivalent), computes total as bill plus tip, and prints both values.",
      },
      {
        id: "input",
        title: "Ask for the bill",
        explanation: `Right now the bill is always 50. **input()** lets the person using your program type it in.

\`\`\`python
name = input("What's your name? ")
print("Hi", name)
\`\`\`

input() always gives back **text**. To do maths with it, turn it into a number with **float()**:

\`\`\`python
price = float(input("Price? "))
\`\`\`

**Before you press Run:** open the **Input** tab under the editor and type a number, like \`80\`. That's what input() will read.`,
        task: "Change bill = 50 so the bill comes from input() instead, turned into a number with float(). Your tip and total should still work.",
        goal: "The bill value comes from input() converted to a number (float() or int()). Tip and total are still calculated from that bill and printed.",
      },
      {
        id: "if-else",
        title: "Make it friendly",
        explanation: `**if** lets your program make a choice. **else** is what happens otherwise.

\`\`\`python
if age >= 13:
    print("You're a teenager!")
else:
    print("You're not a teenager yet.")
\`\`\`

Two rules: the line ends with a **colon** \`:\`, and the code inside is **indented** (4 spaces). That indent is how Python knows which lines belong to the if.`,
        task: 'At the end, if total is more than 100 print "That was a big meal!", otherwise print "Thanks for coming!".',
        goal: "The program uses if/else on total (or bill) with a comparison, and prints a different message in each branch.",
      },
    ],
  },
];

module.exports = { projects };
