# EXAMPLE PYTHON MODULE
# Define some variables:
numberone = 1
ageofqueen = 78


# define some functions
def printhello():
    print("hello")


def timesfour(input):
    print(input * 4)


# define a class
class Piano:
    def __init__(self):
        self.type = input("What type of piano? ")
        self.height = input("What height (in feet)? ")
        self.price = input("How much did it cost? ")
        self.age = input("How old is it (in years)? ")

    def printdetails(self):
        print("This piano is a/an " + self.height + " foot",)
        print(self.type, "piano, " + self.age, "years old and costing" + self.price + " dollars.")
