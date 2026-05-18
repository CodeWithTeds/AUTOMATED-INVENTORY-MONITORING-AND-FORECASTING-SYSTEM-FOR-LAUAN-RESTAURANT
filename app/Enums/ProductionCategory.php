<?php

namespace App\Enums;

enum ProductionCategory: string
{
    case AllMenu = 'all_menu';
    case Burger = 'burger';
    case Juice = 'juice';
    case Bento = 'bento';
    case Salad = 'salad';
    case Tacos = 'tacos';
    case Sushi = 'sushi';
    case RiceMeal = 'rice_meal';

    public function label(): string
    {
        return match ($this) {
            self::AllMenu => 'All Menu',
            self::Burger => 'Burger',
            self::Juice => 'Juice',
            self::Bento => 'Bento',
            self::Salad => 'Salad',
            self::Tacos => 'Tacos',
            self::Sushi => 'Sushi',
            self::RiceMeal => 'Rice Meal',
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::AllMenu => '🍽️',
            self::Burger => '🍔',
            self::Juice => '🍹',
            self::Bento => '🍱',
            self::Salad => '🥗',
            self::Tacos => '🌮',
            self::Sushi => '🍣',
            self::RiceMeal => '🍛',
        };
    }
}
