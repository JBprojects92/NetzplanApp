using CsvHelper.Configuration.Attributes;

namespace NetzplanApp2.Models;

[Delimiter( ";" )]
public class Node
{
    public string Vorgang { get; set; }

    public string Beschreibung { get; set; }

    public int Dauer { get; set; }

    public string Vorgänger { get; set; }
}