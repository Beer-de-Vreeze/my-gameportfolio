import React from "react";
import SuspenseProjectCard from "../projectCard";

const Tetrtis = () => (
  <SuspenseProjectCard
    projectId="Better-Tetris"
    title="Tetris"
    description="A comprehensive Tetris implementation built in Unity featuring the official Super Rotation System and modern gameplay enhancements. The project demonstrates advanced game programming concepts including mathematical rotation matrices, collision detection algorithms, and optimized tilemap rendering. I implemented authentic Tetris mechanics with ghost piece previews, wall kick systems, and data-driven architecture using ScriptableObjects. The game showcases clean code organization, responsive input handling, and persistent scoring systems while maintaining the classic Tetris feel with modern technical polish."
    githubLink="https://github.com/Beer-de-Vreeze/Better-Tetris"
    liveLink="https://bjeerpeer.itch.io/better-tetris"
    coverImage="/images/BetterTetris Images/Tetris3.webp"
    media={[
      {
        type: "image",
        src: "/images/BetterTetris Images/Tetris1.webp",
        alt: "Better Tetris Game Screenshot 1",
      },
    ]}
    techStack={["Unity", "C#", "Tilemap", "Game Design"]}
    features={[
      {
        title: "Super Rotation System (SRS) Implementation",
        description:
          "A mathematically precise implementation of the official Super Rotation System with complete wall kick patterns for all tetromino pieces. The system uses rotation matrices for accurate piece transformations and implements complex collision detection with fallback positioning. Features different rotation behaviors for I-pieces and O-pieces, ensuring authentic Tetris gameplay that matches official standards.",
        codeSnippet: {
          title: "Advanced Rotation with Wall Kick System",
          language: "csharp",
          code: `private void Rotate(int direction)
{
    // Store the current rotation in case the rotation fails
    int originalRotation = rotationIndex;
    
    // Rotate all cells using a rotation matrix
    rotationIndex = Wrap(rotationIndex + direction, 0, 4);
    ApplyRotationMatrix(direction);
    
    // Revert the rotation if the wall kick tests fail
    if (!TestWallKicks(rotationIndex, direction))
    {
        rotationIndex = originalRotation;
        ApplyRotationMatrix(-direction);
    }
    else
    {
        PlayRotateSound();
    }
}

private bool TestWallKicks(int rotationIndex, int rotationDirection)
{
    int wallKickIndex = GetWallKickIndex(rotationIndex, rotationDirection);
    
    // Try each possible wall kick offset for this piece type
    for (int i = 0; i < data.wallKicks.GetLength(1); i++)
    {
        Vector2Int translation = data.wallKicks[wallKickIndex, i];
        
        if (Move(translation)) {
            return true; // Wall kick successful
        }
    }
    
    return false; // No valid wall kick found
}

private void ApplyRotationMatrix(int direction)
{
    float[] matrix = Data.RotationMatrix;
    
    // Rotate all cells using the rotation matrix
    for (int i = 0; i < cells.Length; i++)
    {
        Vector3 cell = cells[i];
        int x, y;
        
        switch (data.tetromino)
        {
            case Tetromino.I:
            case Tetromino.O:
                // I and O pieces rotate from offset center point
                cell.x -= 0.5f;
                cell.y -= 0.5f;
                x = Mathf.CeilToInt((cell.x * matrix[0] * direction) + (cell.y * matrix[1] * direction));
                y = Mathf.CeilToInt((cell.x * matrix[2] * direction) + (cell.y * matrix[3] * direction));
                break;
            default:
                // Standard rotation for other pieces
                x = Mathf.RoundToInt((cell.x * matrix[0] * direction) + (cell.y * matrix[1] * direction));
                y = Mathf.RoundToInt((cell.x * matrix[2] * direction) + (cell.y * matrix[3] * direction));
                break;
        }
        cells[i] = new Vector3Int(x, y, 0);
    }
}`,
        },
      },
      {
        title: "Optimized Tilemap Board Management",
        description:
          "A high-performance board system built on Unity's Tilemap architecture for efficient rendering and memory usage. The line clearing algorithm processes full rows optimally and handles cascading line clears with proper tile shifting. Features boundary checking, collision validation, and real-time board state management that maintains smooth performance during intensive gameplay scenarios.",
        codeSnippet: {
          title: "Optimized Line Clearing Algorithm",
          language: "csharp",
          code: `public void ClearLines()
{
    RectInt bounds = Bounds;
    int row = bounds.yMin;
    
    // Clear lines from bottom to top
    while (row < bounds.yMax)
    {
        // Only advance to next row if current row is not cleared
        // because tiles above will fall down when a row is cleared
        if (IsLineFull(row))
        {
            LineClear(row);
        }
        else
        {
            row++;
        }
    }
}

public bool IsLineFull(int row)
{
    RectInt bounds = Bounds;
    
    // Check every column in the row
    for (int col = bounds.xMin; col < bounds.xMax; col++)
    {
        Vector3Int position = new Vector3Int(col, row, 0);
        
        // If any tile is missing, line is not full
        if (!tilemap.HasTile(position))
        {
            return false;
        }
    }
    
    return true;
}

public void LineClear(int row)
{
    RectInt bounds = Bounds;
    int linesCleared = 0;
    
    // Clear all tiles in the row
    for (int col = bounds.xMin; col < bounds.xMax; col++)
    {
        Vector3Int position = new Vector3Int(col, row, 0);
        tilemap.SetTile(position, null);
    }
    
    linesCleared++;
    
    // Shift every row above down one position
    while (row < bounds.yMax)
    {
        for (int col = bounds.xMin; col < bounds.xMax; col++)
        {
            Vector3Int position = new Vector3Int(col, row + 1, 0);
            TileBase above = tilemap.GetTile(position);
            
            position = new Vector3Int(col, row, 0);
            tilemap.SetTile(position, above);
        }
        row++;
    }
    
    // Update score and play audio feedback
    if (linesCleared > 0)
    {
        AddScore(linesCleared);
        playLineClearSound();
        UpdateUI();
    }
}`,
        },
      },
      {
        title: "Real-Time Ghost Piece Drop Simulation",
        description:
          "An optimized ghost piece system that provides instant visual feedback for piece placement. The simulation uses efficient collision detection algorithms to calculate the exact landing position in real-time, temporarily clearing the active piece for accurate boundary testing. Features transparent tile rendering with automatic updates during movement and rotation, helping players plan strategic moves with precise landing position information.",
        codeSnippet: {
          title: "Ghost Piece Drop Simulation",
          language: "csharp",
          code: `public class Ghost : MonoBehaviour
{
    public Tile tile;
    public Board mainBoard;
    public Piece trackingPiece;
    
    public Tilemap tilemap { get; private set; }
    public Vector3Int[] cells { get; private set; }
    public Vector3Int position { get; private set; }
    
    private void Awake()
    {
        tilemap = GetComponentInChildren<Tilemap>();
        cells = new Vector3Int[4];
    }
    
    private void LateUpdate()
    {
        Clear();
        if (trackingPiece != null)
        {
            Copy();
            Drop();
            Set();
        }
    }
    
    private void Clear()
    {
        // Clear previous ghost piece position
        for (int i = 0; i < cells.Length; i++)
        {
            Vector3Int tilePosition = cells[i] + position;
            tilemap.SetTile(tilePosition, null);
        }
    }
    
    private void Copy()
    {
        // Copy the current piece's cell configuration
        for (int i = 0; i < cells.Length; i++) {
            cells[i] = trackingPiece.cells[i];
        }
    }
    
    private void Drop()
    {
        Vector3Int position = trackingPiece.position;
        int current = position.y;
        int bottom = -mainBoard.boardSize.y / 2 - 1;
        
        // Temporarily clear the active piece for accurate collision detection
        mainBoard.Clear(trackingPiece);
        
        // Simulate dropping the piece to find landing position
        for (int row = current; row >= bottom; row--)
        {
            position.y = row;
            
            if (mainBoard.IsValidPosition(trackingPiece, position)) {
                this.position = position;
            } else {
                break; // Hit obstacle, stop dropping
            }
        }
        
        // Restore the active piece to the board
        mainBoard.Set(trackingPiece);
    }
    
    private void Set()
    {
        // Render the ghost piece at the calculated position
        for (int i = 0; i < cells.Length; i++)
        {
            Vector3Int tilePosition = cells[i] + position;
            tilemap.SetTile(tilePosition, tile);
        }
    }
}`,
        },
      },
      {
        title: "Authentic Tetris Scoring & Progress Tracking",
        description:
          "A comprehensive scoring system that implements official Tetris scoring mechanics with exponential multipliers for line clears. Singles award 100 points, doubles 300 (3x), triples 500 (5x), and Tetris clears 800 points (8x). Features persistent high score tracking using PlayerPrefs, real-time UI updates, and separate scoring for piece placement and line clearing events. The system maintains score state across game sessions and provides detailed feedback for player progression.",
        codeSnippet: {
          title: "Multi-Level Scoring Algorithm",
          language: "csharp",
          code: `public void AddScore(int linesCleared)
{
    switch (linesCleared)
    {
        case 1:
            totalScore += scorePerLine;        // Single: 100 pts
            break;
        case 2:
            totalScore += scorePerLine * 3;    // Double: 300 pts (3x multiplier)
            break;
        case 3:
            totalScore += scorePerLine * 5;    // Triple: 500 pts (5x multiplier)
            break;
        case 4:
            totalScore += scorePerLine * 8;    // Tetris: 800 pts (8x multiplier!)
            break;
    }
}

private void Lock()
{
    board.Set(this);
    PlayLandSound();
    
    // Award points for successful piece placement
    board.totalScore += scoreLock;
    board.UpdateUI();
    board.ClearLines();
    board.SpawnPiece();
}

public void UpdateUI()
{
    hud_score.text = "Score\\n" + totalScore.ToString();
    UpdateHighScore();
    hud_highScore.text = "HighScore\\n" + highScore.ToString();
}

private void UpdateHighScore()
{
    if (totalScore > highScore)
    {
        highScore = totalScore;
        // Persist high score across game sessions
        PlayerPrefs.SetInt("highScore", highScore);
    }
}

public void GameOver()
{
    // Save final score for game over screen
    PlayerPrefs.SetInt("lastScore", totalScore);
    PlayerPrefs.SetInt("highScore", highScore);
    SceneManager.LoadScene("GameOver");
}`,
        },
      },
      {
        title: "Responsive Input & Movement System",
        description:
          "A sophisticated input handling system that supports multiple control schemes with precise timing mechanisms. Features customizable keyboard controls, hard drop functionality for instant piece placement, and smooth soft drop mechanics. The system implements proper input buffering, movement delays, and lock timers to prevent accidental inputs while maintaining responsive gameplay. Includes hold piece functionality and automatic gravity with configurable step delays for different difficulty levels.",
        codeSnippet: {
          title: "Advanced Input Processing System",
          language: "csharp",
          code: `private void Update()
{
    board.Clear(this);
    
    // Lock timer prevents premature piece locking
    lockTime += Time.deltaTime;
    
    // Handle rotation inputs
    if (Input.GetKeyDown(KeyCode.X)) {
        Rotate(-1); // Rotate counterclockwise
    } else if (Input.GetKeyDown(KeyCode.Z) || Input.GetKeyDown(KeyCode.UpArrow) || Input.GetKeyDown(KeyCode.W)) {
        Rotate(1);  // Rotate clockwise
    }
    
    // Handle hard drop (instant drop to bottom)
    if (Input.GetKeyDown(KeyCode.Space)) {
        HardDrop();
    }
    
    // Handle piece hold functionality
    if (Input.GetKeyDown(KeyCode.LeftShift)) {
        board.HoldPiece();
    }
    
    // Continuous movement with proper timing
    if (Time.time > moveTime) {
        HandleMoveInputs();
    }
    
    // Automatic downward movement (gravity)
    if (Time.time > stepTime) {
        Step();
    }
    
    board.Set(this);
}

private void HandleMoveInputs()
{
    // Soft drop - faster downward movement
    if (Input.GetKey(KeyCode.DownArrow) || Input.GetKey(KeyCode.S)) {
        if (Move(Vector2Int.down)) {
            // Update step time to prevent double movement
            stepTime = Time.time + stepDelay;
        }
    }
    
    // Horizontal movement with repeat handling
    if (Input.GetKey(KeyCode.LeftArrow) || Input.GetKey(KeyCode.A)) {
        Move(Vector2Int.left);
    } else if (Input.GetKey(KeyCode.RightArrow) || Input.GetKey(KeyCode.D)) {
        Move(Vector2Int.right);
    }
}

private void HardDrop()
{
    // Drop piece instantly to the bottom
    while (Move(Vector2Int.down, true)) {
        continue;
    }
    Lock(); // Immediately lock the piece
}

private bool Move(Vector2Int translation, bool isHardDrop = false)
{
    Vector3Int newPosition = position;
    newPosition.x += translation.x;
    newPosition.y += translation.y;
    
    bool valid = board.IsValidPosition(this, newPosition);
    
    if (valid) {
        position = newPosition;
        moveTime = Time.time + moveDelay;
        lockTime = 0f; // Reset lock timer on successful move
        
        if (!isHardDrop) {
            PlayMoveSound();
        }
    }
    
    return valid;
}`,
        },
      },
      {
        title: "Data-Driven Architecture & Mathematical Precision",
        description:
         "A robust architecture built on data-driven design principles using Unity's ScriptableObjects and mathematical rotation matrices. Features static dictionaries for tetromino shape definitions, precise 90-degree rotation calculations using trigonometric functions, and the complete Super Rotation System wall kick data arrays. The modular design separates game logic from data, making the codebase maintainable and extensible while ensuring mathematical accuracy in all piece transformations and collision calculations.",
        codeSnippet: {
          title: "Tetromino Data & Rotation Mathematics",
          language: "csharp",
          code: `public static class Data
{
    // Mathematical constants for 90-degree rotation matrix
    public static readonly float cos = Mathf.Cos(Mathf.PI / 2f);
    public public static readonly float sin = Mathf.Sin(Mathf.PI / 2f);
    public static readonly float[] RotationMatrix = new float[] { cos, sin, -sin, cos };
    
    // Define all seven tetromino shapes with their cell positions
    public static readonly Dictionary<Tetromino, Vector2Int[]> Cells = 
        new Dictionary<Tetromino, Vector2Int[]>()
    {
        { Tetromino.I, new Vector2Int[] { 
            new Vector2Int(-1, 1), new Vector2Int( 0, 1), 
            new Vector2Int( 1, 1), new Vector2Int( 2, 1) } },
        { Tetromino.J, new Vector2Int[] { 
            new Vector2Int(-1, 1), new Vector2Int(-1, 0), 
            new Vector2Int( 0, 0), new Vector2Int( 1, 0) } },
        { Tetromino.L, new Vector2Int[] { 
            new Vector2Int( 1, 1), new Vector2Int(-1, 0), 
            new Vector2Int( 0, 0), new Vector2Int( 1, 0) } },
        { Tetromino.O, new Vector2Int[] { 
            new Vector2Int( 0, 1), new Vector2Int( 1, 1), 
            new Vector2Int( 0, 0), new Vector2Int( 1, 0) } },
        { Tetromino.S, new Vector2Int[] { 
            new Vector2Int( 0, 1), new Vector2Int( 1, 1), 
            new Vector2Int(-1, 0), new Vector2Int( 0, 0) } },
        { Tetromino.T, new Vector2Int[] { 
            new Vector2Int( 0, 1), new Vector2Int(-1, 0), 
            new Vector2Int( 0, 0), new Vector2Int( 1, 0) } },
        { Tetromino.Z, new Vector2Int[] { 
            new Vector2Int(-1, 1), new Vector2Int( 0, 1), 
            new Vector2Int( 0, 0), new Vector2Int( 1, 0) } },
    };
    
    // Wall kick data for Super Rotation System (SRS)
    // Different patterns for I-piece vs other pieces
    private static readonly Vector2Int[,] WallKicksI = new Vector2Int[,] {
        { new Vector2Int(0, 0), new Vector2Int(-2, 0), new Vector2Int( 1, 0), new Vector2Int(-2,-1), new Vector2Int( 1, 2) },
        { new Vector2Int(0, 0), new Vector2Int( 2, 0), new Vector2Int(-1, 0), new Vector2Int( 2, 1), new Vector2Int(-1,-2) },
        { new Vector2Int(0, 0), new Vector2Int(-1, 0), new Vector2Int( 2, 0), new Vector2Int(-1, 2), new Vector2Int( 2,-1) },
        { new Vector2Int(0, 0), new Vector2Int( 1, 0), new Vector2Int(-2, 0), new Vector2Int( 1,-2), new Vector2Int(-2, 1) },
    };
    
    private static readonly Vector2Int[,] WallKicksJLOSTZ = new Vector2Int[,] {
        { new Vector2Int(0, 0), new Vector2Int(-1, 0), new Vector2Int(-1, 1), new Vector2Int(0,-2), new Vector2Int(-1,-2) },
        { new Vector2Int(0, 0), new Vector2Int( 1, 0), new Vector2Int( 1,-1), new Vector2Int(0, 2), new Vector2Int( 1, 2) },
        { new Vector2Int(0, 0), new Vector2Int( 1, 0), new Vector2Int( 1, 1), new Vector2Int(0,-2), new Vector2Int( 1,-2) },
        { new Vector2Int(0, 0), new Vector2Int(-1, 0), new Vector2Int(-1,-1), new Vector2Int(0, 2), new Vector2Int(-1, 2) },
    };
    
    public static readonly Dictionary<Tetromino, Vector2Int[,]> WallKicks = 
        new Dictionary<Tetromino, Vector2Int[,]>()
    {
        { Tetromino.I, WallKicksI },
        { Tetromino.J, WallKicksJLOSTZ },
        { Tetromino.L, WallKicksJLOSTZ },
        { Tetromino.O, WallKicksJLOSTZ },
        { Tetromino.S, WallKicksJLOSTZ },
        { Tetromino.T, WallKicksJLOSTZ },
        { Tetromino.Z, WallKicksJLOSTZ },
    };
}

[System.Serializable]
public struct TetrominoData
{
    public Tile tile;
    public Tetromino tetromino;
    public Vector2Int[] cells { get; private set; }
    public Vector2Int[,] wallKicks { get; private set; }
    
    public void Initialize()
    {
        cells = Data.Cells[tetromino];
        wallKicks = Data.WallKicks[tetromino];
    }
}`,
        },
      },
    ]}
  />
);

export default Tetrtis;