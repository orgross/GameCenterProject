using System;
using System.Windows;

namespace MathGame
{
    public partial class GameSettingsWindow : Window
    {
        public GameSettingsWindow()
        {
            InitializeComponent();
        }

        private void StartGameButtonClick(object sender, RoutedEventArgs e)
        {
            if (Enum.TryParse(difficultyComboBox.Text, out DifficultyLevel difficulty) && int.TryParse(scoreGoalTextBox.Text, out int scoreGoal))
            {
                NumberGame numberGame = new NumberGame(difficulty, scoreGoal);
                numberGame.Show();
                Close();
            }
            else
            {
                MessageBox.Show("Invalid input. Please enter valid difficulty and score goal.");
            }
        }
    }

    public enum DifficultyLevel
    {
        Easy=1,
        Medium=2,
        Hard=3
    }
}
