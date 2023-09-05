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
using static gameCenter.Projects.NumberGame.Models.Enums;

namespace gameCenter.Projects.NumberGame.Games
{
    /// <summary>
    /// Interaction logic for EasyDoubleGame.xaml
    /// </summary>
    public partial class EasyDoubleGame : Window
    {
        private int num1, num2;
        private ViewModel viewModel = new ViewModel();
        private List<GoodResponse> goodResponses = new List<GoodResponse> { GoodResponse.Good, GoodResponse.Amazing, GoodResponse.Blessing };
        private List<NotGoodResponse> notGoodResponses = new List<NotGoodResponse> { NotGoodResponse.TryAgain, NotGoodResponse.NotGood, NotGoodResponse.YouSuck };
        public EasyDoubleGame()
        {
            InitializeComponent();
            DataContext = viewModel;
            GenerateEquation();
        }

        private void CheckAnswer_Click(object sender, RoutedEventArgs e)
        {
            GoodResponse randomGoodResponse = goodResponses[new Random().Next(goodResponses.Count)];
            NotGoodResponse randomNotGoodResponse = notGoodResponses[new Random().Next(notGoodResponses.Count)];
            int userAnswer;
            if (int.TryParse(Answer.Text, out userAnswer))
            {
                if (userAnswer == num1 * num2)
                {
                    Response.Text = $"{randomGoodResponse}";
                }
                else
                {
                    Response.Text = $"{randomNotGoodResponse}";
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
            num1 = new Random().Next(1, 10);
            num2 = new Random().Next(1, 5);
            viewModel.Description = $"{num1} * {num2} = ?";
        }
    }
    
}

