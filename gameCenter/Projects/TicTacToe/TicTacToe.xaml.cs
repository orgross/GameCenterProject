using gameCenter.Projects.TicTacToe.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;

namespace gameCenter.Projects.TicTacToe
{
    public partial class TicTacToe : Window
    {
        GameTicTacToe GameTicTacToe;

        public TicTacToe()
        {
            InitializeComponent();
            GameTicTacToe=new GameTicTacToe();
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
                    MessageBox.Show($"{GameTicTacToe.CurrentPlayer} wins!", "Game Over", MessageBoxButton.OK, MessageBoxImage.Information);
                    ResetGame();
                }
                else
                {
                    if (GameTicTacToe.IsBoardFull())
                    {
                        MessageBox.Show("It's a draw!", "Game Over", MessageBoxButton.OK, MessageBoxImage.Information);
                        ResetGame();
                    }
                    else
                    {
                        GameTicTacToe.ToggleCurrentPlayer();
                    }
                }
            }
        }
        private void ResetGame()
        {
            GameTicTacToe=new GameTicTacToe();

            foreach (Button button in MainGrid.Children)
            {
                button.Content = "";
            }
        }
        

    }
}
