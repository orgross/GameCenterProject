using System;
using System.Collections.Generic;
using System.Diagnostics.Eventing.Reader;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace gameCenter.Projects.CurrencyConverter.Models
{
    internal class ExchangeResponse
    {
        public bool Success { get; set; }
        public long TimeStamp { get; set; }
        public string Base {get; set; }
        public DateTime Date { get; set; }
        public Dictionary<string,double> Rates { get; set; }


    }
}
