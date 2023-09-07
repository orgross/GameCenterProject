using gameCenter.DataBase;
using gameCenter.Projects;
using gameCenter.Projects.CurrencyConverter;
using gameCenter.Projects.MemoryGame;
using gameCenter.Projects.NumberGame;
using gameCenter.Projects.Project1;
using gameCenter.Projects.TicTacToe;
using gameCenter.Projects.To_Do_List;
using gameCenter.Projects.UserManagmentSystem;
using System;
using System.ComponentModel;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Threading;

namespace gameCenter
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        private UsersList userList;
        private User loggedInUser;
        private DispatcherTimer timer;

        public MainWindow()
        {
            InitializeComponent();
            userList = new UsersList();
            loggedInUser = null;

            timer = new DispatcherTimer();
            timer.Interval = TimeSpan.FromSeconds(1); // Update every second
            timer.Tick += Timer_Tick;
            timer.Start();

            UpdateDateTimeText();
        }
        private void Image_MouseEnter(object sender, MouseEventArgs e)
        {
            Image image = (sender as Image)!;
            image.Opacity = 0.7;
            GameText.Content = (image.Name) switch
            {
                "Image1" => "A User Management System",
                "Image2" => "To Do List Project",
                "Image3" => "Currency Money Converter",
                "Image4" => "Memory Game",
                "Image5" => "The number Games",
                "Image6" => "Tic Tac Toe",
                _ => "Please log in before selecting a game"
            };
        }
        private void Login_Click(object sender, RoutedEventArgs e)
        {
            string usernameInput = UsernameTextBox.Text;
            string passwordInput = PasswordTextBox.Password;

            loggedInUser = userList.LogIn(usernameInput, passwordInput, OutputTextBlock);


            if (loggedInUser != null)
            {
                Login.Visibility = Visibility.Collapsed;
                UserDataPanel.Visibility = Visibility.Visible;

                UsernameDisplay.Text = "Username: " + loggedInUser.Username;
                PointsDisplay.Text = "Points: " + string.Join(", ", loggedInUser.Points);
            }
        }
        private void Logout_Click(object sender, RoutedEventArgs e)
        {
            loggedInUser = null;

            Login.Visibility = Visibility.Visible;
            UserDataPanel.Visibility = Visibility.Collapsed;

            UsernameDisplay.Text = "Username:";
            PointsDisplay.Text = "Points:";
        }
        public void UpdatePoints(int pointsDelta)
        {
            try
            {
                if (loggedInUser != null)
                {
                    loggedInUser.Points += pointsDelta;
                    PointsDisplay.Text = "Points: " + loggedInUser.Points;
                }
                else
                {
                    MessageBox.Show("You need to login before collecting points");
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("An error occurred: " + ex.Message);
            }

        }

        private void Image_MouseLeave(object sender, MouseEventArgs e)
        {
            (sender as Image)!.Opacity = 1;
            GameText.Content = "please pick a game";
        }

        private void Image1_MouseLeftButtonUp(Object sender, MouseButtonEventArgs e)
        {
            UserManagmentSystem userManagmentSystem = new();
            Hide();
            userManagmentSystem.ShowDialog();
            Show();
        }
        private void Image2_MouseLeftButtonUp(Object sender, MouseButtonEventArgs e)
        {
            ToDoList toDoList = new();
            Hide();
            toDoList.ShowDialog();
            Show();
        }
        private void Image3_MouseLeftButtonUp(Object sender, MouseButtonEventArgs e)
        {
            CurrencyConvertorView currencyConvertorView = new CurrencyConvertorView();
            Hide();
            currencyConvertorView.ShowDialog();
            Show();
        }
        private void Image4_MouseLeftButtonUp(Object sender, MouseButtonEventArgs e)
        {
            NumberGame numberGame = new NumberGame();
            Hide();
            numberGame.ShowDialog();
            Show();
        }
        private void Image5_MouseLeftButtonUp(Object sender, MouseButtonEventArgs e)
        {
            TicTacToe ticTacToe = new TicTacToe();
            Hide();
            ticTacToe.ShowDialog();
            Show();
        }
        private void Image6_MouseLeftButtonUp(Object sender, MouseButtonEventArgs e)
        {
            MemoryGame memoryGame = new MemoryGame();
            Hide();
            memoryGame.ShowDialog();
            Show();
        }
        private void Timer_Tick(object sender, EventArgs e)
        {
            UpdateDateTimeText();
        }
        private void UpdateDateTimeText()
        {
            DateTimeTextBlock.Text = DateTime.Now.ToString("dd-MM-yyyy\n     HH:mm:ss");
        }
    }
}
