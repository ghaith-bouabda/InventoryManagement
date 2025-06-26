package com.pfe.GestionDuStock.notification;

import com.pfe.GestionDuStock.product.product;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class LowStockEvent extends ApplicationEvent {
    private final product product;

    public LowStockEvent(Object source, product product) {
        super(source);
        this.product = product;
    }
}
