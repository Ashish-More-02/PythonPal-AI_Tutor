// Python Basics track: one concept per lesson, in teaching order. Each lesson has
// a few small exercises (steps) done in one scratch file, /lessons/<id>.py.
//
// `goal` is for the AI checker only and never leaves the server; `task` is what
// the learner sees. Lesson and step ids are stored in LearnProgress, so don't
// rename them once real users have progress.

const lessons = [
  // Lesson 0 is read-only slides (format: "slides"): no editor, no checker —
  // the learner reads it and marks it complete.
  {
    id: "why-python",
    format: "slides",
    title: "Why Python?",
    description: "What Python is, where it came from, and what you'll be able to do with it.",
    slides: [
      {
        emoji: "👋",
        title: "Welcome to Python",
        body: `A computer can do amazing things, but only if someone gives it **instructions**. Writing those instructions is called **programming**.

**Python** is a language for writing them. It's designed to read almost like English:

\`\`\`python
print("Hello! I'm your first program.")
\`\`\`

That one line is a complete Python program. By the end of this course you'll write programs of your own, from a blank file.`,
      },
      {
        emoji: "📜",
        title: "A little history",
        body: `- **1989**: A Dutch programmer, **Guido van Rossum**, starts Python as a hobby project over the Christmas holidays.
- **1991**: The first version is released to the world.
- **The name** comes from the comedy show *Monty Python's Flying Circus*, not the snake 🐍.
- **2008**: Python 3 arrives, a cleaned-up version. It's the Python everyone uses today, including you.

More than 30 years later, Python is one of the most popular programming languages in the world.`,
      },
      {
        emoji: "🧩",
        title: "Why it's great for beginners",
        body: `**It's easy to read.** Here's "say hello" in Java:

\`\`\`java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello!");
    }
}
\`\`\`

And in Python:

\`\`\`python
print("Hello!")
\`\`\`

**It's free**, runs on every kind of computer, and has a huge friendly community. Whatever question you have, someone has probably already answered it.`,
      },
      {
        emoji: "🌍",
        title: "Where Python is used",
        body: `Python is everywhere, often behind the scenes:

- **Websites & apps**: Instagram's servers are built with Python.
- **AI & machine learning**: most AI research, including the tools behind chatbots, is done in Python.
- **Science & space**: NASA scientists use it, and Python tools helped create the first-ever photo of a black hole in 2019.
- **Data**: companies like Netflix and Spotify use Python to understand what people watch and listen to.
- **Games, robots & gadgets**: from small games to controlling a Raspberry Pi.`,
      },
      {
        emoji: "🚀",
        title: "What you can do with it",
        body: `Once you know Python, you can:

- **Automate boring jobs**: rename 500 photos, tidy a folder, or fill in a spreadsheet in seconds.
- **Build your own tools**: a quiz, a budget tracker, a game, a chatbot.
- **Understand data**: turn a pile of numbers into answers and charts.
- **Take the first step into AI**, web development or data science.

And it's not only for programmers. Scientists, teachers, designers and business people use Python to make their everyday work faster.`,
      },
      {
        emoji: "🗺️",
        title: "How this course works",
        body: `- **Python Basics lessons**: one idea at a time. Read a short explanation, try it in the editor, and **Codey** checks your code.
- **Projects**: use what you learned to build a real program, step by step.
- **Free Practice**: your own space to experiment with anything.
- **Stuck?** Ask Codey anytime. It gives you **hints, not answers**, so you do the learning.

💡 **Tip:** type the code yourself instead of copying it. Mistakes are normal. Every error message is a clue, not a failure.`,
      },
      {
        emoji: "🎯",
        title: "Ready to start?",
        body: `By the end of Python Basics you'll understand **printing, variables, maths, text, input, decisions, loops, lists and functions**. Those are the building blocks of almost every program ever written.

Then you'll put them together in projects, and write Python programs **on your own**.

Mark this lesson complete and let's write your first line of code. 🐍`,
      },
    ],
  },
  {
    id: "print",
    title: "Printing & comments",
    description: "Make Python talk: print text and numbers, and leave notes in your code.",
    starterCode: "# Lesson 1: Printing\n\n",
    steps: [
      {
        id: "hello",
        title: "Your first line of code",
        explanation: `**print()** shows whatever is inside the brackets in the Output.

Text has to go inside quotes. Python calls text in quotes a **string**.

\`\`\`python
print("Hello, World!")
\`\`\`

Type it, press **Run**, and look at the Output under the editor.`,
        task: 'Print the message "Hello, World!"',
        goal: "The program uses print() to display a hello / greeting message. Exact wording and punctuation don't matter.",
      },
      {
        id: "text-and-numbers",
        title: "Text and numbers",
        explanation: `Every **print()** starts a new line in the Output.

Numbers don't need quotes. Without quotes Python even does the maths first:

\`\`\`python
print("My score")
print(7)
print(2 + 3)   # shows 5
print("2 + 3") # shows 2 + 3, because it's text
\`\`\``,
        task: "On one line print your name (as text). On the next line print your age as a number, without quotes.",
        goal: "At least two print() calls: one prints text in quotes, and one prints a number written without quotes.",
      },
      {
        id: "comments",
        title: "Comments",
        explanation: `A line starting with **#** is a **comment**. Python skips it completely — it's a note for humans.

\`\`\`python
# This prints a welcome message
print("Welcome!")
\`\`\`

Good comments say *why* the code is there, so future-you understands it.`,
        task: "Add a comment above your code that explains what your program does. Run it to check it still works.",
        goal: "The code contains at least one # comment (not just the starter comment 'Lesson 1: Printing') and still runs without errors.",
      },
    ],
  },
  {
    id: "variables",
    title: "Variables & data types",
    description: "Store values under a name, and meet Python's basic types: int, float, str and bool.",
    starterCode: "# Lesson 2: Variables\n\n",
    steps: [
      {
        id: "make-variable",
        title: "Make a variable",
        explanation: `A **variable** is a name that holds a value — like a labelled box.

\`\`\`python
city = "London"
year = 2025
print(city)
print(year)
\`\`\`

\`=\` means "put the value on the right into the name on the left". To print what's inside, write the name **without quotes**.`,
        task: "Make a variable name with your name, and a variable age with your age. Print both.",
        goal: "Creates a variable called name holding a string and a variable called age holding a number, and prints both.",
      },
      {
        id: "data-types",
        title: "Data types",
        explanation: `Every value has a **type**:

| Type | Example | What it is |
| --- | --- | --- |
| \`int\` | \`42\` | whole number |
| \`float\` | \`1.75\` | number with a decimal point |
| \`str\` | \`"hi"\` | text (string) |
| \`bool\` | \`True\` / \`False\` | yes or no |

**type()** tells you the type of a value:

\`\`\`python
print(type(42))      # <class 'int'>
print(type("hi"))    # <class 'str'>
\`\`\``,
        task: "Make a variable height with a decimal number, and a variable likes_python set to True. Print the type() of each.",
        goal: "Creates a float variable and a boolean (True/False) variable and prints type() of both, so the output shows <class 'float'> and <class 'bool'>.",
      },
      {
        id: "update-variable",
        title: "Changing a variable",
        explanation: `A variable can change. You can even use its old value to make the new one:

\`\`\`python
coins = 10
coins = coins + 5   # now 15
coins += 5          # shortcut for the same thing, now 20
print(coins)
\`\`\``,
        task: "Make a variable score set to 0. Add 5 to it two times, then print it. You should see 10.",
        goal: "A score variable starts at 0 and is updated using its own old value (score = score + ... or +=) at least once, then printed.",
      },
    ],
  },
  {
    id: "maths",
    title: "Maths with Python",
    description: "Use Python as a calculator: + - * /, whole-number division, remainders and powers.",
    starterCode: "# Lesson 3: Maths\n\n",
    steps: [
      {
        id: "operators",
        title: "The four basics",
        explanation: `| Symbol | Does | Example | Result |
| --- | --- | --- | --- |
| \`+\` | add | \`6 + 2\` | \`8\` |
| \`-\` | subtract | \`6 - 2\` | \`4\` |
| \`*\` | multiply | \`6 * 2\` | \`12\` |
| \`/\` | divide | \`6 / 2\` | \`3.0\` |

Notice \`/\` always gives a float (\`3.0\`), even when it divides evenly.`,
        task: "Print the answers to 12 + 8, 12 * 8 and 12 / 8.",
        goal: "Prints the results of an addition, a multiplication and a division (12 + 8, 12 * 8, 12 / 8 or very similar).",
      },
      {
        id: "floor-mod",
        title: "Sharing things out",
        explanation: `Two more that are super useful:

- **\`//\`** divides and throws away the leftover: \`17 // 5\` is \`3\`
- **\`%\`** gives *only* the leftover (the remainder): \`17 % 5\` is \`2\`
- **\`**\`** is "to the power of": \`2 ** 3\` is \`8\``,
        task: "You have 17 sweets to share between 5 friends. Print how many each friend gets, and how many are left over.",
        goal: "Uses // to get 3 and % to get 2 (from 17 and 5, directly or through variables) and prints both.",
      },
      {
        id: "brackets",
        title: "Brackets first",
        explanation: `Python does \`*\` and \`/\` before \`+\` and \`-\`, just like in maths class:

\`\`\`python
print(2 + 3 * 4)    # 14, not 20
print((2 + 3) * 4)  # 20 — brackets go first
\`\`\``,
        task: "Print the average of 80, 90 and 70. The answer should be 80.0.",
        goal: "Computes the average of 80, 90 and 70 correctly (brackets around the sum, then divide by 3, or equivalent) and the output shows 80.0 or 80.",
      },
    ],
  },
  {
    id: "strings",
    title: "Working with text",
    description: "Join text together, use f-strings, measure text and pick out letters.",
    starterCode: "# Lesson 4: Strings\n\n",
    steps: [
      {
        id: "f-strings",
        title: "Joining text with f-strings",
        explanation: `You can glue strings together with \`+\`, but an **f-string** is easier. Put an \`f\` before the quotes and variables inside \`{ }\`:

\`\`\`python
pet = "cat"
age = 3
print(f"My {pet} is {age} years old")
\`\`\`

Output: \`My cat is 3 years old\``,
        task: "Make variables first_name and last_name. Use an f-string to print your full name in a sentence.",
        goal: "Uses an f-string (f\"...{variable}...\") containing at least one variable, and prints it.",
      },
      {
        id: "len-upper",
        title: "String tools",
        explanation: `Strings come with handy tools:

\`\`\`python
word = "Hello"
print(len(word))      # 5 — how many characters
print(word.upper())   # HELLO
print(word.lower())   # hello
\`\`\``,
        task: 'Make a variable word = "python". Print how long it is, and print it in capital letters.',
        goal: "Uses len() on a string and .upper() (or .lower()) on a string, and prints both results.",
      },
      {
        id: "indexing",
        title: "Picking out letters",
        explanation: `Each character has a position number called an **index**. Counting starts at **0**, not 1!

\`\`\`python
word = "code"
print(word[0])    # c — the first letter
print(word[1])    # o
print(word[-1])   # e — negative counts from the end
\`\`\``,
        task: "Make a variable with any word, then print its first letter and its last letter.",
        goal: "Uses string indexing to print the first character ([0]) and the last character ([-1] or [len(word) - 1]).",
      },
    ],
  },
  {
    id: "input",
    title: "Asking the user",
    description: "Let people type into your program with input(), and turn their answer into a number.",
    starterCode: "# Lesson 5: Input\n\n",
    steps: [
      {
        id: "input-text",
        title: "input()",
        explanation: `**input()** waits for the user to type something, and gives it back as a string:

\`\`\`python
colour = input("What's your favourite colour? ")
print(f"{colour} is a great colour!")
\`\`\`

**Before you press Run:** open the **Input** tab under the editor and type your answer there. That's what input() will read.`,
        task: 'Ask the user for their name with input(), then print "Hello, <name>!" using their answer.',
        goal: "Uses input() to read a name into a variable and prints a greeting that includes that variable.",
      },
      {
        id: "input-numbers",
        title: "Turning text into numbers",
        explanation: `input() **always** gives back text — even if they typed \`12\`. Text can't do maths:

\`\`\`python
age = input("Age? ")   # "12" — a string
age = int(age)         # 12 — now a number
print(age + 1)         # 13
\`\`\`

Use **int()** for whole numbers and **float()** for decimals. You can do it in one line: \`age = int(input("Age? "))\``,
        task: "Ask the user for their age, turn it into a number, and print how old they'll be next year.",
        goal: "Reads the age with input(), converts it with int() or float(), adds 1 and prints the result.",
      },
    ],
  },
  {
    id: "if-else",
    title: "Making decisions",
    description: "Compare values and let your program choose what to do with if, elif and else.",
    starterCode: "# Lesson 6: If / else\n\n",
    steps: [
      {
        id: "comparisons",
        title: "True or False?",
        explanation: `A **comparison** asks a yes/no question and gives back \`True\` or \`False\`:

| Symbol | Means |
| --- | --- |
| \`==\` | equal to (two = signs!) |
| \`!=\` | not equal to |
| \`>\` \`<\` | greater / less than |
| \`>=\` \`<=\` | greater / less than or equal |

\`\`\`python
print(5 > 3)    # True
print(5 == 3)   # False
\`\`\``,
        task: "Print three different comparisons — make at least one True and one False.",
        goal: "Prints at least three comparisons using comparison operators, with at least one True and one False result.",
      },
      {
        id: "if-else",
        title: "if and else",
        explanation: `**if** runs code only when a comparison is True. **else** runs when it's False.

\`\`\`python
temperature = 30
if temperature > 25:
    print("It's hot!")
else:
    print("It's not too hot.")
\`\`\`

Two rules: end the line with a **colon** \`:\`, and **indent** the code inside (4 spaces).

Tip: a number is even when \`number % 2 == 0\` (remember \`%\` from Lesson 3?).`,
        task: 'Make a variable number. Use if/else to print "even" or "odd".',
        goal: "Uses if/else with a % 2 check on a number variable and prints even or odd correctly.",
      },
      {
        id: "elif",
        title: "More choices with elif",
        explanation: `**elif** ("else if") adds more choices. Python checks them top to bottom and runs the **first** one that's True:

\`\`\`python
speed = 45
if speed > 70:
    print("Too fast!")
elif speed > 30:
    print("Nice and steady")
else:
    print("Very slow")
\`\`\``,
        task: "Make a variable score. Print A if it's 90 or more, B if it's 75 or more, otherwise C.",
        goal: "Uses an if / elif / else chain with at least three branches on a score variable, with the thresholds in the right order so each grade is reachable.",
      },
    ],
  },
  {
    id: "for-loops",
    title: "Repeating with for",
    description: "Stop copy-pasting: repeat code with for loops and range().",
    starterCode: "# Lesson 7: For loops\n\n",
    steps: [
      {
        id: "range",
        title: "for and range()",
        explanation: `A **for loop** repeats the indented code once for each value:

\`\`\`python
for i in range(1, 4):
    print(i)
\`\`\`

Output: \`1\`, \`2\`, \`3\`. **range(1, 4)** counts from 1 up to — but **not including** — 4.`,
        task: "Use a for loop to print the numbers 1 to 10.",
        goal: "A for loop with range() prints the numbers 1 through 10 (inclusive), one per iteration.",
      },
      {
        id: "times-table",
        title: "Loops with maths",
        explanation: `The loop variable is a normal variable — you can use it in maths and f-strings:

\`\`\`python
for n in range(1, 4):
    print(f"{n} doubled is {n * 2}")
\`\`\``,
        task: "Print the 5 times table from 5 x 1 = 5 up to 5 x 10 = 50 using a loop.",
        goal: "A for loop prints the 5 times table for 1 to 10, calculating each answer from the loop variable (not typed out by hand).",
      },
      {
        id: "running-total",
        title: "Adding things up",
        explanation: `To add up lots of numbers, keep a **running total** that starts at 0 and grows each time round the loop:

\`\`\`python
total = 0
for n in range(1, 4):
    total = total + n
print(total)   # 6  (1 + 2 + 3)
\`\`\`

Notice \`print(total)\` is **not** indented, so it runs once, after the loop finishes.`,
        task: "Use a loop to add up every number from 1 to 100, then print the total. (It should be 5050.)",
        goal: "Uses a loop that adds each number into a total variable and prints 5050.",
      },
    ],
  },
  {
    id: "while-loops",
    title: "Repeating with while",
    description: "Keep going until something changes with while loops and break.",
    starterCode: "# Lesson 8: While loops\n\n",
    steps: [
      {
        id: "countdown",
        title: "while loops",
        explanation: `A **while loop** repeats as long as its condition is True:

\`\`\`python
lives = 3
while lives > 0:
    print(f"Lives left: {lives}")
    lives = lives - 1
print("Game over")
\`\`\`

⚠️ Always change the variable inside the loop. If the condition never becomes False, the loop runs forever!`,
        task: 'Count down from 5 to 1 with a while loop, then print "Liftoff!"',
        goal: "A while loop with a counter that decreases prints 5, 4, 3, 2, 1, then Liftoff! is printed after the loop.",
      },
      {
        id: "break",
        title: "Stopping with break",
        explanation: `**break** jumps out of a loop straight away. It's handy with \`while True\`, which would otherwise never end:

\`\`\`python
n = 1
while True:
    n = n * 3
    if n > 50:
        break
print(n)   # 81
\`\`\``,
        task: "Start with a number at 1 and keep doubling it until it's bigger than 1000. Print the final number.",
        goal: "A loop doubles a number starting from 1 and stops (via its condition or break) once it passes 1000, printing 1024.",
      },
    ],
  },
  {
    id: "lists",
    title: "Lists",
    description: "Keep many values in one variable, change the list, and loop through it.",
    starterCode: "# Lesson 9: Lists\n\n",
    steps: [
      {
        id: "make-list",
        title: "Making a list",
        explanation: `A **list** holds many values in order, inside square brackets:

\`\`\`python
games = ["chess", "tag", "minecraft"]
print(games[0])     # chess — indexes start at 0, like strings
print(len(games))   # 3
\`\`\``,
        task: "Make a list of at least 3 foods. Print the first one, and print how many foods are in the list.",
        goal: "Creates a list with at least 3 items, prints one item using an index, and prints len() of the list.",
      },
      {
        id: "change-list",
        title: "Changing a list",
        explanation: `Lists can grow and shrink:

\`\`\`python
games = ["chess", "tag"]
games.append("football")   # add to the end
games.remove("tag")        # take one out
print(games)               # ['chess', 'football']
\`\`\``,
        task: "Add a new food to your list with append(), remove one with remove(), then print the whole list.",
        goal: "Uses .append() to add and .remove() (or .pop()) to take away an item, then prints the list.",
      },
      {
        id: "loop-list",
        title: "Looping through a list",
        explanation: `A for loop can go through a list directly — each time round, the variable is the next item:

\`\`\`python
for game in games:
    print(f"I like {game}")
\`\`\``,
        task: 'Loop through your food list and print "I like <food>" for each one.',
        goal: "A for loop goes over the list items directly and prints a message containing each item.",
      },
    ],
  },
  {
    id: "functions",
    title: "Functions",
    description: "Name a block of code and reuse it, give it inputs, and get answers back.",
    starterCode: "# Lesson 10: Functions\n\n",
    steps: [
      {
        id: "def",
        title: "Making a function",
        explanation: `A **function** is a named block of code you can run whenever you want. Make it with **def**, then **call** it by writing its name with brackets:

\`\`\`python
def cheer():
    print("Hip hip")
    print("Hooray!")

cheer()
cheer()
\`\`\`

Defining a function doesn't run it — only calling it does.`,
        task: "Write a function called say_hello that prints a greeting. Call it two times.",
        goal: "Defines a function with def and calls it at least twice, so its output appears at least twice.",
      },
      {
        id: "parameters",
        title: "Giving a function inputs",
        explanation: `A **parameter** is a variable the function gets when you call it:

\`\`\`python
def cheer(name):
    print(f"Go {name}!")

cheer("Sam")    # Go Sam!
cheer("Priya")  # Go Priya!
\`\`\``,
        task: "Change say_hello so it takes a name and greets that person. Call it with two different names.",
        goal: "Defines a function with at least one parameter that is used inside it, and calls it with two different arguments.",
      },
      {
        id: "return",
        title: "Getting an answer back",
        explanation: `**return** sends a value back to where the function was called, so you can store or print it:

\`\`\`python
def double(n):
    return n * 2

answer = double(21)
print(answer)   # 42
\`\`\`

print() only *shows* a value. return *gives it back* so the rest of your program can use it.`,
        task: "Write a function square(n) that returns n times n. Print square(4) and square(9).",
        goal: "Defines a function that uses return to give back n * n (or n ** 2), and prints the results of calling it (16 and 81).",
      },
    ],
  },
];

module.exports = { lessons };
