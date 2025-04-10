namespace NetzplanApp2.Models;

public class NodeDTO
{
    public string Vorgang { get; set; }

    public string Beschreibung { get; set; }

    public int Dauer { get; set; }

    public List<NodeDTO>? Vorgänger { get; set; }

    public int FAZ { get; set; }

    public int SEZ { get; set; }

    public int FEZ { get; set; }

    public int SAZ { get; set; }

    public int GP { get; set; }

    public int FP { get; set; }

    public bool Critical { get; set; }
}