using gameCenter.Projects.NumberGame.Games;
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
using static gameCenter.Projects.NumberGame.Models.Enums;

namespace gameCenter.Projects.NumberGame
{
    /// <summary>
    /// Interaction logic for NumberGame.xaml
    /// </summary>
    public partial class NumberGame : Window
    {
        public string playerName;
        
        public NumberGame()
        {
            InitializeComponent();
        }
        private void StartGameButton_Click(object sender, RoutedEventArgs e)
        {
            playerName = nameTextBox.Text;
            int selectedGame = Convert.ToInt32(((ComboBoxItem)gameComboBox.SelectedItem).Tag);
            int numPlays = Convert.ToInt32(playsComboBox.Text);

            this.Hide();

            switch (gameComboBox.SelectedIndex)
            {
                case 0:
                    gameComboBox.Text = "Plus Game (Easy)";
                    EasyPlusGame easyPlus = new EasyPlusGame();
                    easyPlus.ShowDialog();
                    break;
                case 1:
                    gameComboBox.Text = "Plus Game (Hard)";
                    HardPlusGame hardPlus = new HardPlusGame();
                    hardPlus.ShowDialog();
                    break;
                case 2:
                    gameComboBox.Text = "Double Game (Easy)";
                    EasyDoubleGame easyDouble = new EasyDoubleGame();
                    easyDouble.ShowDialog();
                    break;
                case 3:
                    gameComboBox.Text = "Double Game (Hard)";
                    HardDoubleGame hardDouble = new HardDoubleGame();
                    hardDouble.ShowDialog();
                    break;
            }

            this.Show();

        }
        private void NumberGamePlusEasy(int numPlays)
        {
            for (int i = 0; i < numPlays; i++)
            {
                int num1 = new Random().Next(1, 15);
                int num3 = new Random().Next(1, 6);

                Console.Write($"{num1} + {num3} = ");
                int userAnswer;
                if (int.TryParse(Console.ReadLine(), out userAnswer))
                {
                    if (userAnswer == num1 + num3)
                    {
                       // GoodResponse randomGoodResponse = goodResponses[new Random().Next(goodResponses.Count)];
                        //Console.WriteLine($"{randomGoodResponse}, {playerName}");
                    }
                    else
                    {
                       // NotGoodResponse randomNotGoodResponse = notGoodResponses[new Random().Next(notGoodResponses.Count)];
                       // Console.WriteLine($"{randomNotGoodResponse}, {playerName}");
                    }
                }
                else
                {
                    Console.WriteLine("Invalid input. Please enter a valid number.");
                }
            }

            Console.WriteLine($"Hey {playerName}");
            Console.WriteLine("Thank you for playing this game. See you soon!");
        }

        private void nameTextBox_TextChanged(object sender, TextChangedEventArgs e)
        {

        }
    }
}
