using CsvHelper.Configuration.Attributes;

namespace NetzplanApp2.Models;

[Delimiter( ";" )]
public class Node
{
    public string Vorgang { get; set; }

    public string Beschreibung { get; set; }

    public int Dauer { get; set; }

    public string Vorgänger { get; set; }

    //public int FSZ { get; set; }

    //public int SEZ { get; set; }

    //public int FEZ { get; set; }

    //public int SSZ { get; set; }

    //public int GP { get; set; }

    //public int FP { get; set; }
}