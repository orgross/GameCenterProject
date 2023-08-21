using gameCenter.Projects.CurrencyConverter.Services;
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

namespace gameCenter.Projects.CurrencyConverter
{
    /// <summary>
    /// Interaction logic for CurrencyConvertorWindow.xaml
    /// </summary>
    public partial class CurrencyConvertorView : Window
    {
        private CurrencyService _currencyService;
        private Dictionary<string, double> _exchangeRates;

        public CurrencyConvertorView()
        {
            InitializeComponent();
            _currencyService = new CurrencyService();
            LoadCurrencies();
        }

        private async Task LoadCurrencies()
        {
            try
            {
                Dictionary<string, double> exchangeKeys = await _currencyService.GetExchangeRatesAsync();
                string[] exchangeRateKeys = exchangeKeys.Keys.Select(key => key).ToArray();
                FromCurrencyComboBox.ItemsSource = exchangeRateKeys;
                ToCurrencyComboBox.ItemsSource = exchangeRateKeys;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred while making the HTTP request: {ex.Message}");
            }
        }
        
        private void btnConvert_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                string fromCurrency = FromCurrencyComboBox.SelectedItem.ToString();
                string toCurrency = ToCurrencyComboBox.SelectedItem.ToString();
                double amount= double.Parse(AmountTextBox.Text);

                double baseToFromRate = _exchangeRates[fromCurrency];
                double baseToToRate = _exchangeRates[toCurrency];

                double convertedAmount = (baseToToRate/baseToFromRate)*amount;

                txtResult.Text = convertedAmount.ToString();
            }
            catch(Exception ex)
            {
                Console.WriteLine($"Error:{ex.Message}");
            }
        
        }
        
    }
}
