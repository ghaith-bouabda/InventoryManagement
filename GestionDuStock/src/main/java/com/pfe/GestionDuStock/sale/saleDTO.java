package com.pfe.GestionDuStock.sale;

import java.time.LocalDateTime;
import java.util.List;

public record saleDTO(List<saleitemDTO> saleItems, long amount, LocalDateTime date) {
}
