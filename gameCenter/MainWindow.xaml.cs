using gameCenter.Projects.CurrencyConverter;
using gameCenter.Projects.Project1;
using gameCenter.Projects.To_Do_List;
using System;
using System.ComponentModel;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace gameCenter
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
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
                "Image5" => "Calculator App",
                "Image6" => "XO Game",
                _ => "please pick a game"
            };
        }

        private void Image_MouseLeave(object sender, MouseEventArgs e)
        {
            (sender as Image)!.Opacity = 1;
            GameText.Content = "please pick a game";
        }

        private void Image1_MouseLeftButtonUp(Object sender, MouseButtonEventArgs e)
        {
            Project1 project1 = new();
            Hide();
            project1.ShowDialog();
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


    }
}
