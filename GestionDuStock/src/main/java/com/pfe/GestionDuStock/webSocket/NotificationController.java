package com.pfe.GestionDuStock.webSocket;

import com.pfe.GestionDuStock.product.product;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class NotificationController {

    @MessageMapping("/check-low-stock")
    @SendTo("/topic/lowStock")
    public String sendLowStockNotification(product product) {
        // Send notification when the stock is low
        if (product.getStockQuantity() <= product.getStockThreshold()) {
            return "Low stock alert for product: " + product.getName();
        }
        return null;
    }
}
