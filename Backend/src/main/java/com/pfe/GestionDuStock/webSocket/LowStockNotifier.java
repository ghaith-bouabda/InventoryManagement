package com.pfe.GestionDuStock.webSocket;

import com.pfe.GestionDuStock.notification.LowStockEvent;
import com.pfe.GestionDuStock.product.product;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LowStockNotifier {

    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleLowStockEvent(LowStockEvent event) {
        product product = event.getProduct();
        if (product.getStockQuantity() <= product.getStockThreshold()) {
            // Always send notification without any checks
            messagingTemplate.convertAndSend("/topic/lowStock",
                    "Low stock for product: " + product.getName());
        }
    }
}