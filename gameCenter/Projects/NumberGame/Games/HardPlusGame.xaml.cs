using NumberGameApp;
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

namespace gameCenter.Projects.NumberGame.Games
{
    /// <summary>
    /// Interaction logic for HardPlusGame.xaml
    /// </summary>
    public partial class HardPlusGame : Window
    {
        private int num1, num2;
        private ViewModel viewModel = new ViewModel();
        public HardPlusGame()
        {
            InitializeComponent();
            DataContext = viewModel;
            GenerateEquation();
        }

        private void CheckAnswer_Click(object sender, RoutedEventArgs e)
        {
            int userAnswer;
            if (int.TryParse(Answer.Text, out userAnswer))
            {
                if (userAnswer == num1 + num2)
                {
                    Response.Text = "Good";
                }
                else
                {
                    Response.Text = "Bad";
                }
            }
            else
            {
                Console.WriteLine("enter only numbers");
            }
            GenerateEquation();

        }

        private void GenerateEquation()
        {
            num1 = new Random().Next(1, 15);
            num2 = new Random().Next(1, 10);
            viewModel.Description = $"{num1} + {num2} = ?";
        }
    }
}
