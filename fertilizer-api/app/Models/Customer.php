<?php

namespace App\Models;

/**
 * Customer Alias Model representing storefront buyers in the `users` table.
 */
class Customer extends User
{
    protected $table = 'users';
}
