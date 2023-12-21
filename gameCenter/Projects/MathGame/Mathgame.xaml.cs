using gameCenter;
using System;
using System.Windows;

namespace MathGame
{
    public partial class NumberGame : Window
    {
        private Tuple<string, int> expressionAndAnswer;
        private int score;
        private DifficultyLevel difficulty;
        private int scoreGoal;


        public NumberGame(DifficultyLevel difficulty, int scoreGoal)
        {
            InitializeComponent();
            this.difficulty = difficulty;
            this.scoreGoal = scoreGoal;
            StartNewGame();
            score = 0;
        }


        private void StartNewGame()
        {
            DifficultyLevel selectedDifficulty = difficulty;
            expressionAndAnswer = GenerateExpression(selectedDifficulty);

            expressionText.Text = expressionAndAnswer.Item1;
            answerTextBox.Text = string.Empty;
            resultText.Text = string.Empty;

            UpdateScore();
        }


        private Tuple<string, int> GenerateExpression(DifficultyLevel difficulty)
        {
            Random random = new Random();
            int num1, num2;
            string expression;
            int answer;

            switch (difficulty)
            {
                case DifficultyLevel.Easy:
                    num1 = random.Next(1, 11);
                    num2 = random.Next(1, 11);
                    expression = $"{num1} + {num2}";
                    answer = num1 + num2;
                    break;
                case DifficultyLevel.Medium:
                    num1 = random.Next(1, 11);
                    num2 = random.Next(1, 11);
                    expression = $"{num1} x {num2}";
                    answer = num1 * num2;
                    break;
                case DifficultyLevel.Hard:
                    num1 = random.Next(1, 11);
                    num2 = random.Next(1, 11);
                    expression = $"{num1} + {num2} x {num1}";
                    answer = num1 + (num2 * num1);
                    break;
                default:
                    throw new ArgumentException("Invalid difficulty level");
            }

            return Tuple.Create(expression, answer);
        }

        private void UpdateScore()
        {
            scoreText.Text = $"Score: {score}";
        }

        private void SubmitButtonClick(object sender, RoutedEventArgs e)
        {
            if (int.TryParse(answerTextBox.Text, out int userAnswer))
            {
                if (userAnswer == expressionAndAnswer.Item2)
                {
                    resultText.Text = "Congratulations! You got it right!";
                    score += 10; // Increase score for correct answer
                }
                else
                {
                    resultText.Text = $"Oops! The correct answer is {expressionAndAnswer.Item2}. Better luck next time.";
                    score -= 5; // Decrease score for incorrect answer
                }

                StartNewGame();
            }
            else
            {
                resultText.Text = "Invalid input. Please enter a valid number.";
            }

            UpdateScore();

            if (score >= scoreGoal)
            {
                resultText.Text = $"Congratulations! You reached the score goal of {scoreGoal}. Game Over!";
                // Optionally: Disable input controls or handle end-game logic
                RestartButtonClick(sender, e);
            }
        }

        private void RestartButtonClick(object sender, RoutedEventArgs e)
        {
            var result = MessageBox.Show("Choose an option:\n Yes: Go to the main window\n No: Restart game settings and play again\n Cancel: Restart game", "Game Over", MessageBoxButton.YesNoCancel);

            if (result == MessageBoxResult.Yes)
            {
                // Go to the main window (you can replace this with your actual main window)
                MainWindow mainWindow = new MainWindow();
                Close();
            }
            else if (result == MessageBoxResult.No)
            {
                // Go to the game settings window
                GameSettingsWindow gameSettingsWindow = new GameSettingsWindow();
                gameSettingsWindow.Show();
                Close();
            }
            // If Cancel, the game will be restarted with the same difficulty and score goal
            else
            {
                StartNewGame();
                score = 0;
                scoreGoal = 0;
            }
        }


    }
}
