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

namespace gameCenter.Projects.MemoryGame
{

    public partial class MemoryGame : Window
    {
        private List<string> images;
        private List<string> shuffledImages;
        private Button lastFlippedCard;

        public MemoryGame()
        {
            InitializeComponent();
            InitializeGame();
        }

        private void InitializeGame()
        {
            // Define the images for the cards
            images = new List<string>
            {
                "cat", "dog", "Tiger", "Jiraf", "Penguin", "Elephent"
             };

            // Duplicate the images to create a full set of cards
            images.AddRange(images);

            // Shuffle the images
            shuffledImages = ShuffleList(images);

            // Create buttons and assign images
            for (int i = 0; i < shuffledImages.Count; i++)
            {
                Button cardButton = new Button
                {
                    Name = "btnCard" + i,
                    Content = new Image
                    {
                        Source = new BitmapImage(new Uri($"/Projects/MemoryGame/ImagesMemory/BackGroundCard.png", UriKind.Relative)),
                        Stretch = System.Windows.Media.Stretch.Fill
                    }
                };

                cardButton.Click += CardButtonClick;

                cardGrid.Children.Add(cardButton);
            }
        }


        private async void CardButtonClick(object sender, RoutedEventArgs e)
        {
            Button clickedCard = (Button)sender;
            int index = cardGrid.Children.IndexOf(clickedCard);

            // Flip the card
            FlipCard(clickedCard, shuffledImages[index]);

            if (lastFlippedCard == null)
            {
                // First card is flipped
                lastFlippedCard = clickedCard;
            }
            else
            {
                // Second card is flipped
                // Check for a match
                if (shuffledImages[cardGrid.Children.IndexOf(lastFlippedCard)] == shuffledImages[index])
                {
                    // Match found, disable the matched cards
                    lastFlippedCard.IsEnabled = false;
                    clickedCard.IsEnabled = false;
                }
                else
                {
                    // No match, flip the cards back after a delay
                    await Task.Delay(500); // Delay for better visibility
                    FlipCard(lastFlippedCard, "BackGroundCard");
                    FlipCard(clickedCard, "BackGroundCard");
                }

                // Reset for the next pair
                lastFlippedCard = null;


            }
            if (AllCardsMatched())
            {
                ShowCongratulationsPopup();
            }
        }

        private void FlipCard(Button cardButton, string imageName)
        {
            Image cardImage = (Image)cardButton.Content;
            cardImage.Source = new BitmapImage(new Uri($"/Projects/MemoryGame/ImagesMemory/{imageName}.png", UriKind.Relative));
        }

        private List<T> ShuffleList<T>(List<T> list)
        {
            Random random = new Random();
            int n = list.Count;
            while (n > 1)
            {
                n--;
                int k = random.Next(n + 1);
                T value = list[k];
                list[k] = list[n];
                list[n] = value;
            }
            return list;
        }

        // Add this method to handle the restart button click
        private void RestartGame_Click(object sender, RoutedEventArgs e)
        {
            // Clear the existing cards and restart the game
            cardGrid.Children.Clear();
            InitializeGame();
        }

        private bool AllCardsMatched()
        {
            foreach (var child in cardGrid.Children)
            {
                if (child is Button cardButton && cardButton.IsEnabled)
                    return false; // If any card is still enabled, the game is not finished
            }
            return true; // All cards are matched
        }

        private void ShowCongratulationsPopup()
        {
            MessageBox.Show("Congratulations! You've finished the game.", "Game Over", MessageBoxButton.OK, MessageBoxImage.Information);
        }
    }
}

