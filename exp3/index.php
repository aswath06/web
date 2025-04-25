<?php
$host = 'localhost';
$dbname = 'inventory_db';
$username = 'root';
$password = '';
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $itemName = $_POST['item_name'];
    $itemCode = $_POST['item_code'];
    $quantity = $_POST['quantity'];
    echo "Item Name: " . htmlspecialchars($itemName) . "<br>";
    echo "Item Code: " . htmlspecialchars($itemCode) . "<br>";
    echo "Quantity: " . htmlspecialchars($quantity) . "<br>";
    try {
        $stmt = $pdo->prepare("INSERT INTO inventory (item_name, item_code, quantity) VALUES (?, ?, ?)");
        $stmt->execute([$itemName, $itemCode, $quantity]);
        echo "Item added successfully!";
    } catch (PDOException $e) {
        echo "Error: " . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Inventory Management with QR Code</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
            color: #333;
        }

        h1, h2 {
            text-align: center;
            margin-bottom: 20px;
        }

        form {
            max-width: 500px;
            margin: 0 auto 40px auto;
            padding: 20px;
            background-color: #ffffff;
            border: 1px solid #ddd;
            border-radius: 5px;
        }

        label {
            display: block;
            margin-bottom: 6px;
            font-weight: bold;
        }

        input, textarea {
            width: 100%;
            padding: 8px;
            margin-bottom: 15px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }

        button {
            background-color: #007BFF;
            color: white;
            padding: 10px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        button:hover {
            background-color: #0056b3;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            background-color: #fff;
        }

        th, td {
            padding: 10px;
            text-align: center;
            border: 1px solid #ddd;
        }

        th {
            background-color: #f0f0f0;
        }

        img {
            max-width: 100px;
            height: auto;
        }
    </style>
</head>
<body>
    <h1>Add Inventory Item</h1>
    <form method="POST">
        <label for="item_name">Item Name:</label>
        <input type="text" name="item_name" id="item_name" required>
        <br><br>
        <label for="item_code">Item Code:</label>
        <input type="text" name="item_code" id="item_code" required>
        <br><br>
        <label for="quantity">Quantity:</label>
        <input type="number" name="quantity" id="quantity" required>
        <br><br>
        <button type="submit">Add Item</button>
    </form>
    <h2>Inventory List</h2>
    <table border="1" cellpadding="10">
        <tr>
            <th>ID</th>
            <th>Item Name</th>
            <th>Item Code</th>
            <th>Quantity</th>
            <th>QR Code</th>
        </tr>
        <?php
        try {
            $stmt = $pdo->query("SELECT * FROM inventory");
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                echo "<tr>";
                echo "<td>" . htmlspecialchars($row['id']) . "</td>";
                echo "<td>" . htmlspecialchars($row['item_name']) . "</td>";
                echo "<td>" . htmlspecialchars($row['item_code']) . "</td>";
                echo "<td>" . htmlspecialchars($row['quantity']) . "</td>";
                $qrData = urlencode("id=" . $row['id'] . "&item_name=" . $row['item_name'] . "&item_code=" . $row['item_code'] . "&quantity=" . $row['quantity']);
                echo "<td><img src='https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=$qrData' alt='QR Code'></td>";
                echo "</tr>";
            }
        } catch (PDOException $e) {
            echo "Error fetching inventory: " . $e->getMessage();
        }
        ?>
    </table>
</body>
</html>
CREATE TABLE inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(100),
    item_code VARCHAR(100),
    quantity INT
);