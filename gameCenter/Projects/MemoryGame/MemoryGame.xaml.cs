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
using WpfApp1.Models;

namespace gameCenter.Projects.MemoryGame
{ 
    public partial class MemoryGame : Window
    {
        private Button firstCard;
        private Button secondCard;
        private int numberOfColumns = 4;

        public MemoryGame()
        {
            InitializeComponent();
            InitializeGame();
        }

        private void InitializeGame()
        {
            ShuffleCards();

            int row = 0;
            int col = 0;

            // Create a list to store each image path twice
            List<string> doubledCardImages = new List<string>(cardImages);

            foreach (string imagePath in cardImages)
            {
                doubledCardImages.Add(imagePath);
                doubledCardImages.Add(imagePath); // Add the same image path again to create a pair
            }

            ShuffleCards(doubledCardImages); // Shuffle the list again to mix up the pairs

            foreach (string imagePath in doubledCardImages)
            {
                Button card = FindName($"Card{row}{col}") as Button;
                if (card != null)
                {
                    // Set the image for the card
                    Image cardImage = new Image();
                    cardImage.Source = new BitmapImage(new Uri($"Images/{imagePath}", UriKind.Relative)); // Assuming your images are in a folder called "Images"
                    card.Content = cardImage;

                    // Handle additional properties like card sizes, margins, etc., here if needed
                }

                col++;
                if (col == numberOfColumns)
                {
                    col = 0;
                    row++;
                }
            }
        }

        private void Card_Click(object sender, RoutedEventArgs e)
        {
            if (firstCard == null)
            {
                firstCard = (Button)sender;
                FlipCard(firstCard);
            }
            else if (secondCard == null)
            {
                secondCard = (Button)sender;
                FlipCard(secondCard);

                // Check if the two flipped cards match
                if (CheckMatch())
                {
                    // Cards match, keep them face up
                    firstCard = null;
                    secondCard = null;
                }
                else
                {
                    // Cards do not match, flip them back after a delay
                    var timer = new System.Windows.Threading.DispatcherTimer();
                    timer.Tick += new EventHandler((s, args) =>
                    {
                        FlipCard(firstCard);
                        FlipCard(secondCard);
                        firstCard = null;
                        secondCard = null;
                        timer.Stop();
                    });
                    timer.Interval = new TimeSpan(0, 0, 2); // Adjust the delay as needed
                    timer.Start();
                }
            }
        }
        private void ShuffleCards()
        {
            Random random = new Random();
            int n = cardImages.Count;
            while (n > 1)
            {
                n--;
                int k = random.Next(n + 1);
                string value = cardImages[k];
                cardImages[k] = cardImages[n];
                cardImages[n] = value;
            }
        }
        private void ShuffleCards(List<string> strings)
        {
            Random random = new Random();
            int n = strings.Count;
            while (n > 1)
            {
                n--;
                int k = random.Next(n + 1);
                string value = strings[k];
                strings[k] = strings[n];
                strings[n] = value;
            }
        }

        private void FlipCard(Button card)
        {
            // Change the image on the card
            // You can use card.Background to set the image
        }

        private bool CheckMatch()
        {
            // Compare the images on firstCard and secondCard
            // Return true if they match, false otherwise
            return false; // Placeholder, implement your logic
        }
        private List<string> cardImages = new List<string>
        {
            "Projects\\MemoryGame\\Images\\cat.png",
            "Projects\\MemoryGame\\Images\\dog.png",
            "Projects\\MemoryGame\\Images\\Elephent.png.jpeg",
            "Projects\\MemoryGame\\Images\\Jiraf.png.jpg",
            "Projects\\MemoryGame\\Images\\Penguin.png",
            "Projects\\MemoryGame\\Images\\Tiger.jpg",
        };
    }
}
