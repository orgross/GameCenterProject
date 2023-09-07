using gameCenter.Projects.TicTacToe.Models;
using System.Windows;
using System.Windows.Controls;

namespace gameCenter.Projects.TicTacToe
{
    public partial class TicTacToe : Window
    {
        private GameTicTacToe GameTicTacToe;

        public TicTacToe()
        {
            InitializeComponent();
            GameTicTacToe = new GameTicTacToe();
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            Button button = (Button)sender;

            if (button != null && string.IsNullOrEmpty(button.Content as string))
            {
                button.Content = GameTicTacToe.CurrentPlayer.ToString();
                int row = Grid.GetRow(button);
                int column = Grid.GetColumn(button);
                GameTicTacToe.GameBoard[row, column] = GameTicTacToe.CurrentPlayer;

                if (GameTicTacToe.CheckForWin())
                {
                    StatusLabel.Content = $"{GameTicTacToe.CurrentPlayer} wins!";
                    DisableAllButtons();
                }
                else
                {
                    if (GameTicTacToe.IsBoardFull())
                    {
                        StatusLabel.Content = "It's a draw!";
                    }
                    else
                    {
                        GameTicTacToe.ToggleCurrentPlayer();
                        StatusLabel.Content = $"{GameTicTacToe.CurrentPlayer}'s turn";
                    }
                }
            }
        }
        private void DisableAllButtons()
        {
            foreach (UIElement element in MainGrid.Children)
            {
                if (element is Button button && button != NewGameButton)
                {
                    button.IsEnabled = false;
                }
            }
        }
        private void NewGame_Click(object sender, RoutedEventArgs e)
        {
            GameTicTacToe = new GameTicTacToe();
            StatusLabel.Content = "X's turn"; // Start with X's turn
            EnableAllButtons();

            foreach (UIElement element in MainGrid.Children)
            {
                if (element is Button button)
                {
                    button.Content = "";
                }
            }
        }
        private void EnableAllButtons()
        {
            foreach (UIElement element in MainGrid.Children)
            {
                if (element is Button button)
                {
                    button.IsEnabled = true;
                }
            }
        }

    }
}
