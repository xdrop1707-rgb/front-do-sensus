#  Clínica Psicológica - Banco de Dados

##  Sobre o Projeto

Este repositório contém a estrutura completa do banco de dados para o sistema de gestão de uma clínica psicológica.


### Opção 1: PostgreSQL Puro

```bash
psql -U postgres -c "CREATE DATABASE clinica_psicologica;"
psql -U postgres -d clinica_psicologica -f scripts/clinica_postgresql_puro.sql